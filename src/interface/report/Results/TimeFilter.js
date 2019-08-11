import React from 'react';
import PropTypes from 'prop-types';

import TimeInput from './TimeInput';

class TimeFilter extends React.PureComponent {
  static propTypes = {
    fight: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    applyFilter: PropTypes.func.isRequired,
  };

  constructor(...args){
    super(...args);
    this.phaseRef = React.createRef();
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

  componentDidUpdate(prevProps, prevState, prevContext) {
    if(this.props.fight !== prevProps.fight){
      this.setState(this.generateBoundary());
    }
  }

  selectStart(time) {
    this.setState({start: time});
  }

  selectEnd(time) {
    this.setState({end: time});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.applyFilter(this.state.start, this.state.end);
  }

  handleReset(e){
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
        {' to '}
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
