import React from 'react';
import PropTypes from 'prop-types';

import BackgroundOverlay from './Images/background-overlay.png';

const styles = {
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

class AppBackgroundImage extends React.PureComponent {
  static propTypes = {
    image: PropTypes.string,
  };

  render() {
    const { image } = this.props;

    return (
      <div style={styles.container}>
        <div
          style={{
            ...styles.image,
            backgroundImage: `url(${image})`,
          }}
        />
        <div
          style={styles.overlay}
        />
      </div>
    );
  }
}

export default AppBackgroundImage;
