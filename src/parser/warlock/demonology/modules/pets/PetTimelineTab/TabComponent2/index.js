import React from 'react';
import PropTypes from 'prop-types';

import CombatLogParser from 'parser/core/CombatLogParser';
import DragScroll from 'interface/common/DragScroll';
import { formatDuration } from 'common/format';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';

import PetTimelineProcesser from './PetTimelineProcesser';
import KeyCastsRow from './KeyCastsRow';
import PetRow from './PetRow';
import './Timeline.scss';

const ZOOM = 2;

class TimelineTab extends React.Component {
  static propTypes = {
    parser: PropTypes.instanceOf(CombatLogParser).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      timelineHeight: 50,
    };
    this.setHeight = this.setHeight.bind(this);
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
    return 120 / ZOOM;
  }

  get totalWidth() {
    return this.seconds * this.secondWidth;
  }

  get skipInterval() {
    return Math.ceil(40 / this.secondWidth);
  }

  setHeight(element) {
    if (!element || !element.clientHeight) {
      return;
    }
    this.setState({
      timelineHeight: element.clientHeight,
    });
  }
  // shamelessly copied from new Timeline
  render() {
    const processer = new PetTimelineProcesser(this.props.parser, this.secondWidth);
    const keyEvents = processer.keyEvents;
    const pets = processer.groupedPets;

    const padding = 30;
    return (
      <>
        <div className="col-lg-3" ref={this.setHeight}>
          <div className="lane">
            Key casts
          </div>
          {Object.keys(pets).map(spellId => (
            <div className="lane" key={spellId}>
              {spellId !== 'unknown' && <SpellLink id={Number(spellId)} />}
              {spellId === 'unknown' && (
                <>
                  <Icon icon="inv_misc_questionmark" /> Unknown pet
                </>
              )}
            </div>
          ))}
        </div>
        <div className="col-lg-9" style={{ height: this.state.timelineHeight + 70 }}>
          <DragScroll className="spell-timeline-container" style={{ height: '100%' }}>
            <div
              className="spell-timeline"
              style={{
                width: this.totalWidth + padding * 2,
                paddingTop: 5,
                paddingBottom: 0,
                paddingLeft: padding,
                paddingRight: padding,
                height: '100%',
              }}
            >
              <KeyCastsRow events={keyEvents} />
              {Object.values(pets).map((petArray, index) => (
                <PetRow key={`petRow-${index}`} pets={petArray} top={index * 33} />
              ))}
              <div className="time-line" style={{ top: `${Object.values(pets).length * 33}px` }}>
                {this.seconds > 0 && [...Array(Math.ceil(this.seconds))].map((_, second) => (
                  <div
                    key={second}
                    style={{ width: this.secondWidth * this.skipInterval }}
                    data-duration={formatDuration(second)}
                  />
                ))}
              </div>
            </div>
          </DragScroll>
        </div>
      </>
    );
  }
}

export default TimelineTab;
