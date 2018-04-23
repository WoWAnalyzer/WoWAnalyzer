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

    if (this.state.time < 1000) {
      // It's best practice to not show a loading indicator (especially a flashy animation) within 1 second of the request. This is both distracting and gives the feeling that the app is slower than if it actually showed nothing.
      return null;
    }

    return (
      <div className="container">
        <div className="text-center" style={{ marginTop: 50, marginBottom: 50 }}>
          <h1>{text}</h1>
          <div className="spinner" style={{ marginTop: 50, marginBottom: 50 }} />
          {this.state.time > 4000 && (
            <div>
              It's taking longer than normal...
            </div>
          )}
          {this.state.time > 8000 && (
            <div>
              A lot longer than normal...
            </div>
          )}
          {this.state.time > 12000 && (
            <div>
              Giving up in 3
            </div>
          )}
          {this.state.time > 13000 && (
            <div>
              2
            </div>
          )}
          {this.state.time > 14000 && (
            <div>
              1
            </div>
          )}
          {this.state.time > 21000 && (
            <div>
              Shit I forgot to update this when I increased the timeout to 30 seconds for the folks from Australia. Sorry if you're from Australia and you have internet for snails.
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ActivityIndicator;
