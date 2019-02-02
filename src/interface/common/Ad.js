import React from 'react';
import PropTypes from 'prop-types';

class Ad extends React.PureComponent {
  static propTypes = {
    style: PropTypes.object,
  };

  componentDidMount() {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  render() {
    const { style, ...others } = this.props;

    return (
      <ins
        className="adsbygoogle"
        style={style ? { display: 'block', ...style } : { display: 'block' }}
        data-ad-client="ca-pub-8048055232081854"
        data-ad-slot="5976455458"
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...others}
      />
    );
  }
}

export default Ad;
