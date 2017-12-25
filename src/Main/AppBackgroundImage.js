import React from 'react';
import PropTypes from 'prop-types';

import { findByBossId } from 'Raids';

import BackgroundOverlay from './Images/background-overlay.png';

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -10,
    transition: 'opacity 1s',
    background: '#000',
  },
  active: {
    opacity: 1,
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
    bossId: PropTypes.number,
    override: PropTypes.string,
  };

  constructor() {
    super();
    this.state = {
      image: null,
      show: false,
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.bossId !== this.props.bossId) {
      const bossId = newProps.bossId;
      const boss = findByBossId(bossId);
      if (boss) {
        this.setState({
          image: boss.background,
        });
      } else {
        console.warn('Missing boss definition:', bossId);
      }
      this.setState({
        show: !!newProps.bossId && boss,
      });
    }
  }

  render() {
    const { override } = this.props;

    let containerStyle = styles.container;
    if (this.state.show || override) {
      containerStyle = {
        ...containerStyle,
        ...styles.active,
      };
    }

    return (
      <div style={containerStyle}>
        <div
          style={{
            ...styles.image,
            backgroundImage: this.state.image || override ? `url(${override || this.state.image})` : null,
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
