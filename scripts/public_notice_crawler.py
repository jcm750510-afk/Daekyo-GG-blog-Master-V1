from __future__ import annotations

import csv
import io
import json
import os
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright

OUT = Path("public/data/public-notices.json")
USER_AGENT = "Daekyo-GG-Blog-Master/1.0 (+public-notice-crawler)"
NOTICE_WORDS = ("공고", "고시", "공지", "모집", "채용", "입찰", "지원사업", "교육")
DATE_RE = re.compile(r"(20\d{2})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})")


def fetch_text(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", errors="replace")


def sheet_rows(sheet_csv_url: str):
    raw = fetch_text(sheet_csv_url)
    for row in csv.DictReader(io.StringIO(raw)):
        yield {k.strip(): (v or "").strip() for k, v in row.items()}


def robots_allowed(url: str) -> bool:
    p = urlparse(url)
    robots = f"{p.scheme}://{p.netloc}/robots.txt"
    rp = RobotFileParser()
    rp.set_url(robots)
    try:
        rp.parse(fetch_text(robots).splitlines())
        return rp.can_fetch(USER_AGENT, url)
    except Exception:
        # robots 확인 실패는 허용으로 간주하지 않고 안전하게 건너뜁니다.
        return False


def parse_date(text: str):
    m = DATE_RE.search(text)
    if not m:
        return None
    try:
        return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)), tzinfo=timezone.utc)
    except ValueError:
        return None


def crawl_source(page, row, since: datetime, until: datetime):
    institution = row.get("institution") or row.get("기관명") or "공공기관"
    url = row.get("url") or row.get("URL") or row.get("source_url") or row.get("수집URL")
    keywords = [x.strip() for x in re.split(r"[,|]", row.get("keywords") or row.get("키워드") or "") if x.strip()]
    if not url or not url.startswith(("http://", "https://")):
        return []
    if not robots_allowed(url):
        return []

    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(500)
    anchors = page.locator("a")
    found = []
    for i in range(min(anchors.count(), 500)):
        a = anchors.nth(i)
        title = (a.inner_text() or "").strip()
        href = a.get_attribute("href") or ""
        if not title or not href:
            continue
        text = f"{title} {href}"
        if not any(w in text for w in NOTICE_WORDS):
            continue
        full = urljoin(url, href)
        matched = [k for k in keywords if k.lower() in text.lower()]
        date = parse_date(text)
        if date and not (since <= date <= until):
            continue
        found.append({"institution": institution, "title": title, "date": date.isoformat() if date else "", "type": row.get("type") or row.get("유형") or "공고·고시", "url": full, "matchedKeywords": matched})
    return found


def main():
    sheet_url = os.environ.get("GOOGLE_SHEET_CSV_URL", "").strip()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    if not sheet_url:
        OUT.write_text(json.dumps({"updatedAt": datetime.now(timezone.utc).isoformat(), "notices": [], "message": "GOOGLE_SHEET_CSV_URL is not configured"}, ensure_ascii=False, indent=2), encoding="utf-8")
        return

    now = datetime.now(timezone.utc)
    since = now - timedelta(days=7)
    until = now + timedelta(days=1)
    rows = list(sheet_rows(sheet_url))
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(user_agent=USER_AGENT)
        for row in rows:
            try:
                results.extend(crawl_source(page, row, since, until))
            except Exception:
                pass
            time.sleep(1.0)  # 프로젝트 원칙: 사람 한 명 수준 이하의 요청 빈도
        browser.close()

    unique = {}
    for item in results:
        unique[item["url"]] = item
    final = sorted(unique.values(), key=lambda x: x.get("date") or "", reverse=True)
    OUT.write_text(json.dumps({"updatedAt": now.isoformat(), "since": since.isoformat(), "notices": final[:300]}, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
