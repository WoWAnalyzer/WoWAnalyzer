import React from 'react';
import PropTypes from 'prop-types';

import { Consumer } from 'interface/LocationContext';

class Ad extends React.PureComponent {
  static propTypes = {
    style: PropTypes.object,
  };

  componentDidMount() {
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

    if (window.adblocked === undefined) {
      console.log('Adblock detected');
    }

    return (
      <ins
        className="adsbygoogle"
        data-ad-client="ca-pub-8048055232081854"
        {...props}
        {...others}
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
