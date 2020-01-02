import React from 'react';

import TimeInput from './TimeInput';
import { Fight } from '../PhaseParser';

interface Props {
  fight: Fight,
  isLoading: boolean,
  applyFilter: (start: number, end: number) => void,
}

interface State {
  start: number,
  end: number,
  max: number,
}

class TimeFilter extends React.PureComponent<Props, State> {

  constructor(props: Props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.selectStart = this.selectStart.bind(this);
    this.selectEnd = this.selectEnd.bind(this);
    this.state = this.generateBoundary();
  }

  generateBoundary(){
    return {
      start: this.props.fight.offset_time,
      end: this.props.fight.end_time - this.props.fight.start_time + this.props.fight.offset_time,
      max: (this.props.fight.original_end_time || this.props.fight.end_time) - this.props.fight.start_time + this.props.fight.offset_time,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if(this.props.fight !== prevProps.fight){
      this.setState(this.generateBoundary());
    }
  }

  selectStart(time: number) {
    this.setState({start: time});
  }

  selectEnd(time: number) {
    this.setState({end: time});
  }

  handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.applyFilter(this.state.start, this.state.end);
  }

  handleReset(e: React.MouseEvent<HTMLButtonElement>){
    e.preventDefault();
    this.props.applyFilter(0, this.state.max);
  }

  invalidTimes(){
    return this.state.end <= this.state.start || this.state.end < 0 || this.state.end > this.state.max || this.state.start < 0 || this.state.start > this.state.max;
  }

  isReset(){
    return (this.props.fight.offset_time === 0 && this.props.fight.end_time === this.props.fight.original_end_time);
  }

  render() {
    const {isLoading} = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        <TimeInput name="start" min={0} max={this.state.max} time={this.state.start} onChange={this.selectStart} />
         to 
        <TimeInput name="end" min={0} max={this.state.max} time={this.state.end} onChange={this.selectEnd} />
        <div className="buttons">
          <button type="submit" name="filter" className="btn btn-primary filter animated-button" disabled={isLoading || this.invalidTimes()}>
            Filter<span className="glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
          <button onClick={this.handleReset} name="reset" className="btn btn-primary reset-filter animated-button" disabled={isLoading || this.isReset()}>
            Reset Filter<span className="glyphicon glyphicon-chevron-right" aria-hidden />
            </button>
        </div>
      </form>
    );
  }
}

export default TimeFilter;
