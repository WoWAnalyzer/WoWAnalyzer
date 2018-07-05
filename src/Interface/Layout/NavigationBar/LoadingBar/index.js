import React from 'react';
import PropTypes from 'prop-types';

import './LoadingBar.css';

class LoadingBar extends React.PureComponent {
  static propTypes = {
    progress: PropTypes.number,
    chunks: PropTypes.number,
  };
  static defaultProps = {
    progress: 0,
    chunks: 12,
  };
  constructor(props) {
    super(props);
    this.state = {
      chunksArray: [...Array(props.chunks)],
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.chunks !== this.props.chunks) {
      this.setState({
        chunksArray: [...Array(newProps.chunks)],
      });
    }
  }

  render() {
    const { progress, chunks } = this.props;

    const progressPerChunk = 1 / chunks;

    return (
      <div
        className="LoadingBar"
        data-progress={progress}
      >
        {this.state.chunksArray.map((_, chunk) => {
          const startProgress = chunk * progressPerChunk;
          const endProgress = startProgress + progressPerChunk;

          let chunkProgress = 0;
          if (progress < startProgress) {
            chunkProgress = 0;
          } else if (progress > endProgress) {
            chunkProgress = 1;
          } else {
            chunkProgress = (progress - startProgress) / progressPerChunk;
          }

          return (
            <div key={chunk}>
              <div style={{ opacity: chunkProgress }} />
            </div>
          );
        })}
      </div>
    );
  }
}

export default LoadingBar;
