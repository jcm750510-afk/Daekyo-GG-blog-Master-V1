import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { SolruniMotion } from './SolruniMotion';

export const RemotionRoot = () => (
  <>
    <Composition id="SolruniVertical" component={SolruniMotion} durationInFrames={900} fps={30} width={1080} height={1920} defaultProps={{ vertical: true }} />
    <Composition id="SolruniHorizontal" component={SolruniMotion} durationInFrames={900} fps={30} width={1920} height={1080} defaultProps={{ vertical: false }} />
  </>
);

registerRoot(RemotionRoot);
