import React from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

interface Props {
  name: String;
  time: number;
  min: number;
  max: number;
  onChange: (time: number) => void;
}

interface State {
  minutes: number;
  seconds: number;
  milliseconds: number;
}

class TimeInput extends React.PureComponent<Props, State> {
  private mRef = React.createRef<HTMLInputElement>();
  private sRef = React.createRef<HTMLInputElement>();
  private msRef = React.createRef<HTMLInputElement>();

  constructor(props: Props) {
    super(props);
    this.handleChangeM = this.handleChangeM.bind(this);
    this.handleChangeS = this.handleChangeS.bind(this);
    this.handleChangeMs = this.handleChangeMs.bind(this);
    this.submitChange = this.submitChange.bind(this);
    this.changeTime = this.changeTime.bind(this);
    this.state = this.convertTime(this.props.time);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.time !== prevProps.time) {
      this.setState(this.convertTime(this.props.time));
    }
  }

  convertTime(time: number) {
    return {
      milliseconds: this.toMillisecond(time),
      seconds: this.toSecond(time),
      minutes: this.toMinute(time),
    };
  }

  toMinute(ms: number) {
    return Math.trunc(ms / MINUTE);
  }

  toSecond(ms: number) {
    return Math.trunc((ms % MINUTE) / SECOND);
  }

  toMillisecond(ms: number) {
    return Math.trunc(ms % SECOND);
  }

  changeTime(time: number) {
    if (time > this.props.max || time < this.props.min) {
      this.forceUpdate();
      return;
    }
    this.setState(this.convertTime(time));
    this.submitChange(time);

  }

  handleChangeM(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value) || 0;
    if (val > 99) {
      this.forceUpdate();
      return;
    }
    this.changeTime(MINUTE * val + SECOND * this.state.seconds + this.state.milliseconds);
  }

  handleChangeS(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value) || 0;
    if (val > 99) {
      this.forceUpdate();
      return;
    }
    this.changeTime(MINUTE * this.state.minutes + SECOND * val + this.state.milliseconds);
  }

  handleChangeMs(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value) || 0;
    if (val > 999) {
      this.forceUpdate();
      return;
    }
    this.changeTime(MINUTE * this.state.minutes + SECOND * this.state.seconds + val);
  }

  submitChange(time: number) {
    this.props.onChange(time);
  }

  pad(number: number, digits: number) {
    return number.toString().padStart(digits, '0');
  }

  render() {
    const { name } = this.props;
    return (
      <div className={`time-input ${name}`}>
        <input ref={this.mRef} className={`form-control ${name}-minute`} type="number" min="0" max="99" value={this.pad(this.state.minutes, 2)} onChange={this.handleChangeM} />:
        <input ref={this.sRef} className={`form-control ${name}-second`} type="number" min="0" max="99" value={this.pad(this.state.seconds, 2)} onChange={this.handleChangeS} />.
        <input ref={this.msRef} className={`form-control ${name}-millisecond`} type="number" min="0" max="999" value={this.pad(this.state.milliseconds, 3)} onChange={this.handleChangeMs} />
      </div>
    );
  }
}

export default TimeInput;
