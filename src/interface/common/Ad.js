import React from 'react';
import PropTypes from 'prop-types';

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

    const props = {};
    if (!others['data-ad-slot']) {
      // Default to responsive
      props['data-ad-slot'] = '5976455458';
      props['data-ad-format'] = 'auto';
      props['data-full-width-responsive'] = 'true';
    }

    return (
      <ins
        className="adsbygoogle"
        style={style ? { display: 'block', ...style } : { display: 'block' }}
        data-ad-client="ca-pub-8048055232081854"
        {...props}
        {...others}
      />
    );
  }
}

export default Ad;
