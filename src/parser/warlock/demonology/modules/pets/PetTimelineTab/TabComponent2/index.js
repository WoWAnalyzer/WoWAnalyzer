import React from 'react';
import PropTypes from 'prop-types';

import CombatLogParser from 'parser/core/CombatLogParser';
import DragScroll from 'interface/common/DragScroll';
import { formatDuration } from 'common/format';

import PetTimelineProcesser from './PetTimelineProcesser';
import './Timeline.scss';

class TimelineTab extends React.Component {
  static propTypes = {
    parser: PropTypes.instanceOf(CombatLogParser).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      zoom: 2,
      padding: 0,
    };
    this.setContainerRef = this.setContainerRef.bind(this);
  }

  setContainerRef(element) {
    if (!element || !element.getBoundingClientRect) {
      return;
    }
    this.setState({
      padding: element.getBoundingClientRect().x + 15, // 15 for padding
    });
  }

  get fight() {
    return this.props.parser.fight;
  }

  get start() {
    return this.fight.start_time;
  }

  get end() {
    return this.fight.end_time;
  }

  get duration() {
    return this.end - this.start;
  }

  get seconds() {
    return this.duration / 1000;
  }

  get secondWidth() {
    return 120 / this.state.zoom;
  }

  get totalWidth() {
    return this.seconds * this.secondWidth;
  }

  get skipInterval() {
    return Math.ceil(40 / this.secondWidth);
  }

  // shamelessly copied from new Timeline
  render() {
    const processer = new PetTimelineProcesser(this.props.parser, this.secondWidth);
    const keyEvents = processer.keyEvents;
    const pets = processer.groupedPets;
    console.log(keyEvents);
    console.log(pets);
    return (
      <>
        <div className="container" ref={this.setContainerRef} />
        <DragScroll className="spell-timeline-container">
          <div
            className="spell-timeline"
            style={{
              width: this.totalWidth + this.state.padding * 2,
              paddingTop: 0,
              paddingBottom: 0,
              paddingLeft: this.state.padding,
              paddingRight: this.state.padding,
            }}
          >
            <div className="time-line">
              {this.seconds > 0 && [...Array(Math.ceil(this.seconds))].map((_, second) => (
                <div
                  key={second}
                  style={{ width: this.secondWidth * this.skipInterval }}
                  data-duration={formatDuration(second)}
                />
              ))}
            </div>
            {/*<KeyCastsRow events={keyEvents} />*/}
            {/*{pets.map(pet => (*/}
              {/*<PetRow pets={pet} />*/}
            {/*))}*/}
          </div>
        </DragScroll>
      </>
    );
  }
}

export default TimelineTab;
