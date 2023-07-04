import { Trans } from '@lingui/macro';
import Spell from 'common/SPELLS/Spell';
import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import {
  AbilityEvent,
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  FilterCooldownInfoEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
  HasAbility,
} from 'parser/core/Events';
import { Fragment, PureComponent } from 'react';

const PREPHASE_BUFFER = 1000; //ms a prephase event gets displayed before the phase start

type Props = {
  spell?: Spell;
  children: AnyEvent[];
  fightStartTimestamp: number;
  fightEndTimestamp: number;
  secondWidth: number;
  castableBuff?: number;
  style?: React.CSSProperties;
};

class Lane extends PureComponent<Props> {
  getOffsetLeft(timestamp: number) {
    return ((timestamp - this.props.fightStartTimestamp) / 1000) * this.props.secondWidth;
  }

  lastApplyBuff: ApplyBuffEvent | null = null;
  renderEvent(event: AnyEvent) {
    switch (event.type) {
      case EventType.FilterCooldownInfo:
      case EventType.Cast:
        return this.renderCast(event);
      case EventType.UpdateSpellUsable:
        if (event.updateType === UpdateSpellUsableType.RestoreCharge) {
          return (
            <Fragment key={`restorecharge-${event.timestamp}`}>
              {this.renderCooldown(event)}
              {this.renderRecharge(event)}
            </Fragment>
          );
        } else if (event.updateType === UpdateSpellUsableType.EndCooldown) {
          return this.renderCooldown(event);
        } else {
          return null;
        }
      case EventType.ApplyBuff:
        if (this.props.castableBuff === event.ability.guid) {
          this.lastApplyBuff = event;
        }
        return null;
      case EventType.RemoveBuff:
        if (this.props.castableBuff === event.ability.guid) {
          return this.renderCastableWindow(event);
        }
        return null;
      default:
        return null;
    }
  }

  renderCast(event: CastEvent | FilterCooldownInfoEvent) {
    //let pre phase events be displayed one second tick before the phase
    const left = this.getOffsetLeft(
      Math.max(this.props.fightStartTimestamp - PREPHASE_BUFFER, event.timestamp),
    );
    const spellId = event.ability.guid;

    return (
      <SpellLink
        key={`cast-${spellId}-${left}`}
        spell={spellId}
        icon={false}
        className="cast"
        style={{ left }}
      >
        {/*<div style={{ height: level * 30 + 55, top: negative ? 0 : undefined, bottom: negative ? undefined : 0 }} />*/}
        <Icon icon={event.ability.abilityIcon.replace('.jpg', '')} alt={event.ability.name} />
      </SpellLink>
    );
  }

  renderCooldown(event: UpdateSpellUsableEvent) {
    //let pre phase events be displayed one second tick before the phase
    const left = this.getOffsetLeft(
      Math.max(this.props.fightStartTimestamp - PREPHASE_BUFFER, event.chargeStartTimestamp),
    );
    const width =
      ((Math.min(this.props.fightEndTimestamp, event.timestamp) -
        Math.max(this.props.fightStartTimestamp - PREPHASE_BUFFER, event.chargeStartTimestamp)) /
        1000) *
      this.props.secondWidth;
    return (
      <Tooltip
        key={`cooldown-${left}`}
        content={
          <Trans id="interface.report.results.timeline.lane.tooltip.eventOrAbilityCooldown">
            {event.ability.name} cooldown:{' '}
            {((event.timestamp - event.chargeStartTimestamp) / 1000).toFixed(1)}s
          </Trans>
        }
      >
        <div
          className="cooldown"
          style={{
            left,
            width,
          }}
          data-effect="float"
        />
      </Tooltip>
    );
  }

  renderRecharge(event: UpdateSpellUsableEvent) {
    if (event.timestamp > this.props.fightEndTimestamp) {
      return null;
    }
    const left = this.getOffsetLeft(event.timestamp);
    return (
      <Tooltip
        content={
          <Trans id="interface.report.results.timeline.lane.tooltip.chargeRestored">
            Charge restored
          </Trans>
        }
      >
        <div
          key={`recharge-${left}`}
          className="recharge"
          style={{
            left,
          }}
        />
      </Tooltip>
    );
  }

  renderCastableWindow(event: RemoveBuffEvent) {
    const start = this.lastApplyBuff?.timestamp || this.props.fightStartTimestamp;
    const end = event.timestamp;

    return (
      <Tooltip
        content={
          <Trans id="interface.report.results.timeline.lane.tooltip.castable">Castable</Trans>
        }
      >
        <div
          key={`castable-${start}-${end}`}
          className="castable"
          style={{
            left: this.getOffsetLeft(start),
            width:
              ((Math.min(this.props.fightEndTimestamp, end) -
                Math.max(this.props.fightStartTimestamp - PREPHASE_BUFFER, start)) /
                1000) *
              this.props.secondWidth,
          }}
        />
      </Tooltip>
    );
  }

  render() {
    const { children, style, spell } = this.props;

    if ((!spell && children.length === 0) || this.props.secondWidth === 0) {
      return null;
    }

    const abilityEvent = children.find(HasAbility) as AbilityEvent<any> | undefined;
    const abilityIcon = spell?.icon ?? abilityEvent?.ability.abilityIcon.replace('.jpg', '');
    // we use the log name when possible for localization purposes
    const abilityName = abilityEvent?.ability.name ?? spell?.name;

    if (
      children[0]?.type === EventType.FilterCooldownInfo ||
      children[0]?.type === EventType.Cast
    ) {
      //if first cast happened before phase
      const nextChildren = children.slice(1, children.length); //all children following the first cast
      const nextCast =
        nextChildren.findIndex(
          (e) => e.type === EventType.Cast || e.type === EventType.FilterCooldownInfo,
        ) + 1; //add 1 since we're searching through the events FOLLOWING the initial cast
      const nextCD = nextChildren.find(
        (e) =>
          e.type === EventType.UpdateSpellUsable &&
          e.updateType === UpdateSpellUsableType.EndCooldown,
      ); //find next end CD event
      if (nextCD && nextCD.timestamp < this.props.fightStartTimestamp - PREPHASE_BUFFER) {
        //if cooldown ended before the phase (including buffer), remove it to avoid visual overlaps
        children.splice(0, nextCast || children.length); //remove events before the next cast, remove all if there is no next cast to clean up the list
      }
    }

    return (
      <div className="lane" style={style}>
        <div className="legend">
          <Icon icon={abilityIcon} alt={abilityName} />
        </div>

        {children.map((event) => this.renderEvent(event))}
      </div>
    );
  }
}

export default Lane;
