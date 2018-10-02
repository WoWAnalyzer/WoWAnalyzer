import React from 'react';
import PropTypes from 'prop-types';

class CyclingVideo extends React.PureComponent {
  static propTypes = {
    videos: PropTypes.arrayOf(PropTypes.string).isRequired,
    randomValue: PropTypes.number,
  };

  constructor(props) {
    super(props);
    const randomValue = props.randomValue !== undefined ? props.randomValue : Math.random();
    this.state = {
      current: Math.floor(randomValue * props.videos.length),
    };
    this.handleEnded = this.handleEnded.bind(this);
  }

  handleEnded() {
    this.setState({
      current: (this.state.current + 1) % this.props.videos.length,
    });
  }

  render() {
    const { videos, ...others } = this.props;
    const currentVideo = videos[this.state.current];

    return (
      <video
        autoPlay
        muted
        onEnded={this.handleEnded}
        key={currentVideo} // without this the element doesn't rerender properly and wouldn't start the next video
        {...others}
      >
        <source src={currentVideo} type="video/mp4" />
      </video>
    );
  }
}

export default CyclingVideo;
