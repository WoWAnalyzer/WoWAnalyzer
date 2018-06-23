import React from 'react';
import PropTypes from 'prop-types';

class DelayRender extends React.PureComponent {
  static propTypes = {
    delay: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
  };
  state = {
    timerExpired: false,
  };

  timer = null;
  constructor(props) {
    super(props);
    this.timer = setTimeout(() => {
      this.setState({
        timerExpired: true,
      });
    }, props.delay);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { children } = this.props;

    if (!this.state.timerExpired) {
      return this.props.fallback ? this.props.fallback : null;
    }

    return children;
  }
}

export default DelayRender;
