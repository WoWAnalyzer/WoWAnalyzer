import DragScroll from 'interface/DragScroll';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import CombatLogParser from 'parser/core/CombatLogParser';
import { EventType, UpdateSpellUsableType } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import AurasModule from 'parser/core/modules/Auras';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import './Timeline.scss';
import Auras from './Auras';
import Casts, { isApplicableEvent } from './Casts';
import Cooldowns from './Cooldowns';
import TimeIndicators from './TimeIndicators';

export function isApplicableUpdateSpellUsableEvent(event, startTime) {
  if (
    event.updateType !== UpdateSpellUsableType.EndCooldown &&
    event.updateType !== UpdateSpellUsableType.RestoreCharge
  ) {
    // begincooldown is unnecessary since endcooldown includes the start time
    return false;
  }
  if (event.updateType === UpdateSpellUsableType.RestoreCharge && event.timestamp < startTime) {
    //ignore restore charge events if they happen before the phase
    return false;
  }
  const spellId = event.ability.guid;
  if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
    return false;
  }
  return true;
}

class Timeline extends PureComponent {
  static propTypes = {
    abilities: PropTypes.instanceOf(Abilities).isRequired,
    auras: PropTypes.instanceOf(AurasModule).isRequired,
    movement: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
        distance: PropTypes.number,
      }),
    ),
    parser: PropTypes.instanceOf(CombatLogParser).isRequired,
    config: PropTypes.shape({
      separateCastBars: PropTypes.array,
    }),
  };
  static defaultProps = {
    showCooldowns: true,
    showGlobalCooldownDuration: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      zoom: 2,
      padding: 0,
    };
    this.setContainerRef = this.setContainerRef.bind(this);
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
  get offset() {
    return this.fight.offset_time;
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

  isApplicableEvent(event) {
    switch (event.type) {
      case EventType.FilterCooldownInfo:
      case EventType.Cast:
        return this.isApplicableCastEvent(event);
      case EventType.UpdateSpellUsable:
        return isApplicableUpdateSpellUsableEvent(event, this.start);
      case EventType.ApplyBuff:
      case EventType.RemoveBuff:
        return this.isApplicableBuffEvent(event);
      default:
        return false;
    }
  }
  isApplicableCastEvent(event) {
    const parser = this.props.parser;

    if (!parser.byPlayer(event)) {
      // Ignore pet/boss casts
      return false;
    }
    const spellId = event.ability.guid;
    if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
      return false;
    }
    const ability = this.props.abilities.getAbility(spellId);
    if (!ability || !ability.cooldown) {
      return false;
    }
    if (event.timestamp >= this.end) {
      return false;
    }
    return true;
  }
  isApplicableBuffEvent(event) {
    const ability = this.props.abilities.getAbility(event.ability.guid);
    return ability && ability.timelineCastableBuff === event.ability.guid;
  }
  /**
   * @param {object[]} events
   * @returns {Map<int, object[]>} Events grouped by spell id.
   */
  getEventsBySpellId(events) {
    const eventsBySpellId = new Map();
    events.forEach((event) => {
      if (!this.isApplicableEvent(event)) {
        return;
      }

      const spellId = this._getCanonicalId(event.ability.guid);
      if (!eventsBySpellId.has(spellId)) {
        eventsBySpellId.set(spellId, []);
      }
      eventsBySpellId.get(spellId).push(event);
    });
    return eventsBySpellId;
  }

  _getCanonicalId(spellId) {
    const ability = this.props.abilities.getAbility(spellId);
    if (!ability) {
      return spellId; // not a class ability
    }
    return ability.primarySpell;
  }

  setContainerRef(elem) {
    if (!elem || !elem.getBoundingClientRect) {
      return;
    }
    this.setState({
      padding: elem.getBoundingClientRect().x + 15, // 15 for padding
    });
  }

  render() {
    const { parser, abilities, auras, movement } = this.props;

    const skipInterval = Math.ceil(40 / this.secondWidth);

    const eventsBySpellId = this.getEventsBySpellId(parser.eventHistory);

    const allSeparatedIds = this.props.config?.separateCastBars.flat() || [];
    const castEvents = [
      ...(this.props.config?.separateCastBars.map((spellIds) =>
        parser.eventHistory
          .filter(isApplicableEvent(parser.playerId))
          .filter((event) => spellIds.includes(event.ability?.guid)),
      ) || []),
      parser.eventHistory
        .filter(isApplicableEvent(parser.playerId))
        .filter((event) => !allSeparatedIds.includes(event.ability?.guid)),
    ];

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
              paddingRight: this.state.padding, // we also want the user to have the satisfying feeling of being able to get the right side to line up
              margin: 'auto', //center horizontally if it's too small to take up the page
              '--cast-bars': castEvents.length,
            }}
          >
            <Auras
              start={this.start}
              secondWidth={this.secondWidth}
              parser={parser}
              auras={auras}
            />
            <TimeIndicators
              seconds={this.seconds}
              offset={this.offset}
              secondWidth={this.secondWidth}
              skipInterval={skipInterval}
            />
            {castEvents.map((events, index) => (
              <Casts
                key={index}
                start={this.start}
                secondWidth={this.secondWidth}
                events={events}
                // Only show on the main cast bar since that should default to standard casts
                movement={index === castEvents.length - 1 ? movement : undefined}
              />
            ))}
            <Cooldowns
              start={this.start}
              end={this.end}
              secondWidth={this.secondWidth}
              eventsBySpellId={eventsBySpellId}
              abilities={abilities}
            />
          </div>
        </DragScroll>
      </>
    );
  }
}

export default Timeline;
