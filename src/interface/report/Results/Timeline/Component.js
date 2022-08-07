import { Trans } from '@lingui/macro';
import { formatDuration } from 'common/format';
import makeWclUrl from 'common/makeWclUrl';
import DragScroll from 'interface/DragScroll';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import CombatLogParser from 'parser/core/CombatLogParser';
import { EventType } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import BuffsModule from 'parser/core/modules/Buffs';
import DebuffsModule from 'parser/core/modules/Debuffs';
import DistanceMoved from 'parser/shared/modules/DistanceMoved';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import './Timeline.scss';
import Buffs from './Buffs';
import Casts, { isApplicableEvent } from './Casts';
import Cooldowns from './Cooldowns';
import Debuffs from './Debuffs';
import TimeIndicators from './TimeIndicators';

class Timeline extends PureComponent {
  static propTypes = {
    abilities: PropTypes.instanceOf(Abilities).isRequired,
    buffs: PropTypes.instanceOf(BuffsModule).isRequired,
    debuffs: PropTypes.instanceOf(DebuffsModule).isRequired,
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
        return this.isApplicableUpdateSpellUsableEvent(event);
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
  isApplicableUpdateSpellUsableEvent(event) {
    if (event.trigger !== EventType.EndCooldown && event.trigger !== EventType.RestoreCharge) {
      // begincooldown is unnecessary since endcooldown includes the start time
      return false;
    }
    if (event.trigger === EventType.RestoreCharge && event.timestamp < this.start) {
      //ignore restore charge events if they happen before the phase
      return false;
    }
    const spellId = event.ability.guid;
    if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
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
    const { parser, abilities, debuffs, buffs, movement } = this.props;

    const skipInterval = Math.ceil(40 / this.secondWidth);

    const eventsBySpellId = this.getEventsBySpellId(parser.eventHistory);

    const allSeparatedIds = this.props.config?.separateCastBars.flat() || [];
    const castEvents = [
      ...(this.props.config?.separateCastBars.map((spellIds) =>
        parser.eventHistory
          .filter(isApplicableEvent(parser))
          .filter((event) => spellIds.includes(event.ability?.guid)),
      ) || []),
      parser.eventHistory
        .filter(isApplicableEvent(parser))
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
            <Buffs
              start={this.start}
              secondWidth={this.secondWidth}
              parser={parser}
              buffs={buffs}
            />
            <Debuffs
              start={this.start}
              secondWidth={this.secondWidth}
              parser={parser}
              debuffs={debuffs}
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
