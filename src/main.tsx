import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import PublicNoticePanel from './PublicNoticePanel.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PublicNoticePanel />
    <App />
  </StrictMode>,
);