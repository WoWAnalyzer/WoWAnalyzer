import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

import Tooltip from 'common/Tooltip';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';

import { EventType } from 'parser/core/Events';

const PREPHASE_BUFFER = 1000; //ms a prephase event gets displayed before the phase start

class Lane extends React.PureComponent {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.object).isRequired,
    fightStartTimestamp: PropTypes.number.isRequired,
    fightEndTimestamp: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    style: PropTypes.object,
  };

  getOffsetLeft(timestamp) {
    return ((timestamp - this.props.fightStartTimestamp) / 1000) * this.props.secondWidth;
  }

  renderEvent(event) {
    switch (event.type) {
      case EventType.FilterCooldownInfo:
      case EventType.Cast:
        return this.renderCast(event);
      case EventType.UpdateSpellUsable:
        if (event.trigger === EventType.RestoreCharge) {
          return (
            <React.Fragment key={`restorecharge-${event.timestamp}`}>
              {this.renderCooldown(event)}
              {this.renderRecharge(event)}
            </React.Fragment>
          );
        } else {
          return this.renderCooldown(event);
        }
      default:
        return null;
    }
  }
  renderCast(event) {
    //let pre phase events be displayed one second tick before the phase
    const left = this.getOffsetLeft(
      Math.max(this.props.fightStartTimestamp - PREPHASE_BUFFER, event.timestamp),
    );
    const spellId = event.ability.guid;

    return (
      <SpellLink
        key={`cast-${spellId}-${left}`}
        id={spellId}
        icon={false}
        className="cast"
        style={{ left }}
      >
        {/*<div style={{ height: level * 30 + 55, top: negative ? 0 : undefined, bottom: negative ? undefined : 0 }} />*/}
        <Icon icon={event.ability.abilityIcon.replace('.jpg', '')} alt={event.ability.name} />
      </SpellLink>
    );
  }
  renderCooldown(event) {
    //let pre phase events be displayed one second tick before the phase
    const left = this.getOffsetLeft(
      Math.max(this.props.fightStartTimestamp - PREPHASE_BUFFER, event.start),
    );
    const width =
      ((Math.min(this.props.fightEndTimestamp, event.timestamp) -
        Math.max(this.props.fightStartTimestamp - PREPHASE_BUFFER, event.start)) /
        1000) *
      this.props.secondWidth;
    return (
      <Tooltip
        key={`cooldown-${left}`}
        content={
          <Trans id="interface.report.results.timeline.lane.tooltip.eventOrAbilityCooldown">
            {event.name || event.ability.name} cooldown:{' '}
            {((event.timestamp - event.start) / 1000).toFixed(1)}s
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
  renderRecharge(event) {
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

  render() {
    const { children, style } = this.props;

    const ability = children[0].ability;
    if (children[0].type === EventType.FilterCooldownInfo || children[0].type === EventType.Cast) {
      //if first cast happened before phase
      const nextChildren = children.slice(1, children.length); //all children following the first cast
      const nextCast =
        nextChildren.findIndex(
          (e) => e.type === EventType.Cast || e.type === EventType.FilterCooldownInfo,
        ) + 1; //add 1 since we're searching through the events FOLLOWING the initial cast
      const nextCD = nextChildren.find(
        (e) => e.type === EventType.UpdateSpellUsable && e.trigger === 'endcooldown',
      ); //find next end CD event
      if (nextCD && nextCD.end < this.props.fightStartTimestamp - PREPHASE_BUFFER) {
        //if cooldown ended before the phase (including buffer), remove it to avoid visual overlaps
        children.splice(0, nextCast || children.length); //remove events before the next cast, remove all if there is no next cast to clean up the list
      }
    }

    if (children.length === 0) {
      return null;
    }

    return (
      <div className="lane" style={style}>
        <div className="legend">
          <Icon icon={ability.abilityIcon.replace('.jpg', '')} alt={ability.name} />
        </div>

        {children.map((event) => this.renderEvent(event))}
      </div>
    );
  }
}

export default Lane;
