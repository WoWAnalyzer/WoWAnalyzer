import React, { CSSProperties } from 'react';

import BackgroundOverlay from './images/background-overlay.png';

const styles: { [key: string]: CSSProperties } = {
  container: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -10,
    background: '#000',
  },
  image: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    filter: 'blur(3px)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundImage: `url(${BackgroundOverlay})`,
  },
};

interface FullscreenErrorBackgroundImageProps {
  image?: string;
}

const FullscreenErrorBackgroundImage = ({
  image,
}: FullscreenErrorBackgroundImageProps) => (
  <div style={styles.container}>
    <div
      style={{
        ...styles.image,
        backgroundImage: `url(${image})`,
      }}
    />
    <div style={styles.overlay} />
  </div>
);

export default FullscreenErrorBackgroundImage;
