import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Consumer } from 'interface/LocationContext';

class Ad extends React.PureComponent {
  static propTypes = {
    style: PropTypes.object,
  };

  render() {
    const { style, ...others } = this.props;

    const props = {
      style: style ? { display: 'block', ...style } : { display: 'block' },
      ...others,
    };

    let image = '/img/728.jpg';
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
}

// This reloads the ad whenever the URL changes (aka a new page is opened). This does NOT refresh the ad outside of user navigation. This matches the behavior that would be in place if we were a classic server rendered app. Therefore it should be allowed within the terms of Google AdSense.
export default props => (
  <Consumer>
    {location => <Ad key={location.pathname} {...props} />}
  </Consumer>
);
