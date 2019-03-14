import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Consumer } from 'interface/LocationContext';

class Ad extends React.PureComponent {
  static propTypes = {
    style: PropTypes.object,
  };

  get isAdblocked() {
    return window.adblocked !== false && !window.adsbygoogle.loaded;
  }

  componentDidMount() {
    if (this.isAdblocked) {
      return;
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      // "adsbygoogle.push() error: No slot size for availableWidth=0" error that I can't explain
      console.error(err);
    }
  }

  render() {
    const { style, ...others } = this.props;

    const props = {
      style: style ? { display: 'block', ...style } : { display: 'block' },
      ...others,
    };
    if (!props['data-ad-slot']) {
      // Default to responsive
      props['data-ad-slot'] = '5976455458';
      props['data-ad-format'] = 'auto';
      props['data-full-width-responsive'] = 'true';
    }

    if (process.env.REACT_APP_FORCE_PREMIUM === 'false') {
      // Forced to false so we're probably testing ads
      props['data-adtest'] = 'on';
      props.style.background = 'rgba(255, 0, 0, 0.3)';
    }

    if (this.isAdblocked) {
      console.log('Adblock detected, falling back to premium ads.');
      let image = "/img/728.jpg";
      if (props['data-ad-slot'] === '3815063023') { // footer
        image = '/img/premium-square.jpg';
      }
      return (
        <div className="text-center">
          <Link to="/premium">
            <img
              src={image}
              alt="WoWAnalyzer Premium - Did we help? Support us and unlock cool perks."
              style={{ maxWidth: '100%' }}
            />
          </Link>
        </div>
      );
    }

    return (
      <ins
        className="adsbygoogle"
        data-ad-client="ca-pub-8048055232081854"
        {...props}
      />
    );
  }
}

// This reloads the ad whenever the URL changes (aka a new page is opened). This does NOT refresh the ad outside of user navigation. This matches the behavior that would be in place if we were a classic server rendered app. Therefore it should be allowed within the terms of Google AdSense.
export default props => (
  <Consumer>
    {location => <Ad key={location.pathname} {...props} />}
  </Consumer>
);
