import React from 'react';

class Ad extends React.PureComponent {
  componentDidMount() {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  render() {
    return (
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8048055232081854"
        data-ad-slot="5976455458"
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest="on"
      />
    );
  }
}

export default Ad;
