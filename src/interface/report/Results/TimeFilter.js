import React from 'react';
import PropTypes from 'prop-types';

import './PhaseSelector.scss';

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

  render() {
    const {isLoading} = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        <TimeInput style={{display: "inline-block"}} key="start" min={0} max={this.state.max} time={this.state.start} onChange={this.selectStart} />
        {' to '}
        <TimeInput style={{display: "inline-block"}} key="end" min={0} max={this.state.max} time={this.state.end} onChange={this.selectEnd} />
        <button type="submit" class="btn btn-primary filter animated-button" disabled={isLoading || this.state.end <= this.state.start}>
          Filter <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
      </form>
    );
  }
}

export default TimeFilter;
