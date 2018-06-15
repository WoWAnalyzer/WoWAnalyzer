import React from 'react';
import PropTypes from 'prop-types';

class ActivityIndicator extends React.PureComponent {
  static propTypes = {
    text: PropTypes.string,
  };

  timer = null;
  constructor() {
    super();
    this.state = {
      time: 0,
    };
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({
        time: this.state.time + 500,
      });
    }, 500);
  }

  render() {
    const { text } = this.props;

    if (this.state.time < 1500) {
      // It's best practice to not show a loading indicator (especially a flashy animation) within 1 second of the request. This is both distracting and gives the feeling that the app is slower than if it actually showed nothing.
      return null;
    }

    return (
      <div className="container">
        <div className="text-center" style={{ marginTop: 50, marginBottom: 50 }}>
          <h1>{text}</h1>
          <div className="spinner" />
        </div>
      </div>
    );
  }
}

export default ActivityIndicator;
