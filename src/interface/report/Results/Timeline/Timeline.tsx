import DragScroll from 'interface/DragScroll';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import CombatLogParser from 'parser/core/CombatLogParser';
import {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  FilterCooldownInfoEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import AurasModule from 'parser/core/modules/Auras';
import { PureComponent } from 'react';

import './Timeline.scss';
import Auras from './Auras';
import Casts, { isApplicableEvent } from './Casts';
import { EnemyCastsTimeline } from './EnemyCasts';
import Cooldowns from './Cooldowns';
import TimeIndicators from './TimeIndicators';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

export function isApplicableUpdateSpellUsableEvent(
  event: UpdateSpellUsableEvent,
  startTime: number,
) {
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

interface TimelineProps {
  abilities: Abilities;
  enemyCasts?: Array<AnyEvent>;
  auras: AurasModule;
  movement?: Array<{
    start: number;
    end: number;
    distance: number;
  }>;
  parser: CombatLogParser;
  config?: {
    separateCastBars?: Array<Array<number>>;
  };
  visibleAuras?: Set<number>;
  showCooldowns?: boolean;
  showGlobalCooldownDuration?: boolean;
  visibleSpellCategories?: Set<keyof typeof SPELL_CATEGORY>;
}

interface TimelineState {
  zoom?: number;
  filteredEnemyCasts?: Array<AnyEvent>;
}

class Timeline extends PureComponent<TimelineProps, TimelineState> {
  constructor(props: TimelineProps) {
    super(props);
    this.state = {
      zoom: 2,
      filteredEnemyCasts: [],
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle(toggleName: keyof TimelineState) {
    this.setState((prevState: TimelineState) => ({
      [toggleName]: !prevState[toggleName],
    }));
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
    return this.state.zoom ? 120 / this.state.zoom : 120;
  }

  isApplicableEvent(
    event: AnyEvent,
  ): event is
    | CastEvent
    | FilterCooldownInfoEvent
    | ApplyBuffEvent
    | RemoveBuffEvent
    | UpdateSpellUsableEvent {
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

  isApplicableCastEvent(event: CastEvent | FilterCooldownInfoEvent): boolean {
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

  isApplicableBuffEvent(event: ApplyBuffEvent | RemoveBuffEvent): boolean {
    const ability = this.props.abilities.getAbility(event.ability.guid);
    return !!ability && ability.timelineCastableBuff === event.ability.guid;
  }

  getEventsBySpellId(events: Array<AnyEvent>) {
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

  _getCanonicalId(spellId: number) {
    const ability = this.props.abilities.getAbility(spellId);
    if (!ability) {
      return spellId; // not a class ability
    }
    return ability.primarySpell;
  }

  render() {
    const { parser, abilities, auras, movement } = this.props;

    const skipInterval = Math.ceil(40 / this.secondWidth);

    const eventsBySpellId = this.getEventsBySpellId(parser.eventHistory);

    const allSeparatedIds = this.props.config?.separateCastBars?.flat() || [];

    const castEvents = [
      ...(this.props.config?.separateCastBars?.map((spellIds) =>
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
        <div className="container" />
        <DragScroll className="spell-timeline-container">
          <div
            className="spell-timeline"
            style={{
              '--cast-bars': castEvents.length,
              // explicitly setting the width here allows the legend to
              // continue following the left edge of the scroll container
              // for the entire width of the timeline
              width: this.secondWidth * this.seconds,
            }}
          >
            <EnemyCastsTimeline
              seconds={this.seconds}
              start={this.start}
              secondWidth={this.secondWidth}
              offset={this.offset}
              skipInterval={skipInterval}
            />
            <Auras
              start={this.start}
              end={this.end}
              secondWidth={this.secondWidth}
              parser={parser}
              auras={auras}
              visibleAuras={this.props.visibleAuras}
            />
            <TimeIndicators
              seconds={this.seconds}
              offset={this.offset}
              secondWidth={this.secondWidth}
              skipInterval={skipInterval}
            >
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
            </TimeIndicators>
            <Cooldowns
              start={this.start}
              end={this.end}
              secondWidth={this.secondWidth}
              eventsBySpellId={eventsBySpellId}
              abilities={abilities}
              visibleSpellCategories={this.props.visibleSpellCategories}
            />
          </div>
        </DragScroll>
      </>
    );
  }
}

export default Timeline;
