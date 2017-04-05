import React from 'react';

class CircularProgressBar extends React.Component {
  static propTypes = {
    percent: React.PropTypes.number.isRequired,
  };

  static formatPercentage(percentage) {
    return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
  }

  canvas = null;

  componentDidMount() {
    this.draw();
  }
  componentDidUpdate() {
    this.draw();
  }

  draw() {
    const percent = this.props.percent;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const context = this.canvas.getContext('2d');

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.lineCap = 'round';

    context.beginPath();
    context.strokeStyle = 'rgba(255,255,255,0.2)';
    context.lineWidth = 8;
    context.arc(centerX, centerY, 30, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + percent * 100 * 3.6));
    context.stroke();
  }

  render() {
    const { percent } = this.props;

    return (
      <div className="circular-progress-bar">
        <span className="text">{this.constructor.formatPercentage(percent)}%</span>
        <canvas height="74" width="74" ref={(elem) => { this.canvas = elem; }} />
      </div>
    );
  }
}

export default CircularProgressBar;
