import { Trans } from '@lingui/macro';
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { EventType } from 'parser/core/Events';

import { formatDuration } from 'common/format';
import makeWclUrl from 'common/makeWclUrl';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';
import DragScroll from 'interface/common/DragScroll';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Abilities from 'parser/core/modules/Abilities';
import BuffsModule from 'parser/core/modules/Buffs';
import CombatLogParser from 'parser/core/CombatLogParser';

import './Timeline.scss';
import Buffs from './Buffs';
import Casts from './Casts';
import Cooldowns from './Cooldowns';

class Timeline extends React.PureComponent {
  static propTypes = {
    abilities: PropTypes.instanceOf(Abilities).isRequired,
    buffs: PropTypes.instanceOf(BuffsModule).isRequired,
    parser: PropTypes.instanceOf(CombatLogParser).isRequired,
    premium: PropTypes.bool.isRequired,
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
    if (ability.spell instanceof Array) {
      return ability.spell[0].id;
    } else {
      return ability.spell.id;
    }
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
    const { parser, abilities, buffs, premium } = this.props;

    const skipInterval = Math.ceil(40 / this.secondWidth);

    const eventsBySpellId = this.getEventsBySpellId(parser.eventHistory);

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
            }}
          >
            <Buffs
              start={this.start}
              secondWidth={this.secondWidth}
              parser={parser}
              buffs={buffs}
            />
            <div className="time-line">
              {this.seconds > 0 &&
                [...Array(Math.ceil(this.seconds))].map((_, second) => (
                  <div
                    key={second + this.offset / 1000}
                    style={{ width: this.secondWidth * skipInterval }}
                    data-duration={formatDuration(second + this.offset / 1000)}
                  />
                ))}
            </div>
            <Casts start={this.start} secondWidth={this.secondWidth} parser={parser} />
            <Cooldowns
              start={this.start}
              end={this.end}
              secondWidth={this.secondWidth}
              eventsBySpellId={eventsBySpellId}
              abilities={abilities}
            />
          </div>
          {!premium && (
            <div
              className="spell-timeline-premium-box"
              style={{
                left: this.state.padding + 10 * this.secondWidth,
                width: this.totalWidth + this.state.padding - 10 * this.secondWidth,
              }}
            >
              <div>
                <Trans id="timeline.premium.description">
                  The timeline shows your casts, channel times, GCD, active buffs, and cooldowns for
                  a quick overview of what you did. It even incorporates some of our suggestions to
                  give you specific examples of casts that you could improve. All in one easy to use
                  overview.
                </Trans>
                <br />
                <br />
                <strong>
                  <Trans id="timeline.premium.unlock">
                    You need to unlock <Link to="/premium">WoWAnalyzer Premium</Link> to access the
                    full WoWAnalyzer timeline.
                  </Trans>
                </strong>
                <br />
                <br />
                <div style={{ fontSize: 14 }}>
                  <Trans id="timeline.premium.wclTimeline">
                    Not yet ready to join? The{' '}
                    <a
                      href={makeWclUrl(parser.report.code, {
                        fight: parser.fight.id,
                        source: parser ? parser.playerId : undefined,
                        view: 'timeline',
                        type: 'casts',
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WarcraftLogsIcon style={{ height: '1.2em', marginTop: '-0.1em' }} /> Warcraft
                      Logs timeline
                    </a>{' '}
                    shows similar information but with less detail.
                  </Trans>
                </div>
              </div>
            </div>
          )}
        </DragScroll>
      </>
    );
  }
}

export default Timeline;
