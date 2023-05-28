import { CSSProperties } from 'react';

import './LoadingBar.scss';

interface Props {
  progress?: number;
  chunks?: number;
  style?: CSSProperties;
}

const LoadingBar = ({ progress = 0, chunks = 12, ...others }: Props) => {
  const progressPerChunk = 1 / chunks;

  const chunkProgress = (startProgress: number, endProgress: number) => {
    if (progress < startProgress) {
      return 0;
    } else if (progress > endProgress) {
      return 1;
    } else {
      return (progress - startProgress) / progressPerChunk;
    }
  };

  return (
    <div className="LoadingBar" data-progress={progress} {...others}>
      {[...Array(chunks)].map((_, chunk) => {
        const startProgress = chunk * progressPerChunk;
        const endProgress = startProgress + progressPerChunk;

        return (
          <div key={chunk}>
            <div style={{ opacity: chunkProgress(startProgress, endProgress) }} />
          </div>
        );
      })}
    </div>
  );
};

export default LoadingBar;
