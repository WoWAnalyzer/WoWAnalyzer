import { Trans } from '@lingui/macro';
import { formatThousands, formatNumber, formatPercentage, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Icon, SpellIcon, SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import { EventType } from 'parser/core/Events';
import { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';
import PropTypes from 'prop-types';
import { Component } from 'react';

import './Cooldown.css';
import { MaybeTooltip } from 'interface/Tooltip';

class Cooldown extends Component {
  static propTypes = {
    fightStart: PropTypes.number.isRequired,
    fightEnd: PropTypes.number.isRequired,
    cooldown: PropTypes.shape({
      ability: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }),
      start: PropTypes.number.isRequired,
      cdStart: PropTypes.number.isRequired,
      end: PropTypes.number,
      events: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
        }),
      ).isRequired,
      summary: PropTypes.array.isRequired,
      spell: PropTypes.oneOfType([
        PropTypes.shape({
          id: PropTypes.number,
          icon: PropTypes.string,
          name: PropTypes.string,
        }),
        PropTypes.number,
      ]),
      lateEvents: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
          timestamp: PropTypes.number.isRequired,
        }),
      ),
      durationTooltip: PropTypes.string,
    }).isRequired,
    applyTimeFilter: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      showCastEvents: false,
      showAllEvents: false,
    };
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.handleShowHealsClick = this.handleShowHealsClick.bind(this);
  }

  handleExpandClick() {
    this.setState({
      showCastEvents: !this.state.showCastEvents,
      showAllEvents: false,
    });
  }
  handleShowHealsClick() {
    this.setState({
      showAllEvents: !this.state.showAllEvents,
    });
  }

  groupHeals(events) {
    let lastHeal = null;
    return events.reduce((results, event) => {
      if (event.type === EventType.Cast) {
        results.push(event);
      } else if (event.type === EventType.Heal) {
        const spellId = event.ability.guid;
        if (lastHeal && lastHeal.event.ability.guid === spellId) {
          lastHeal.count += 1;
          lastHeal.amount += event.amount;
          lastHeal.absorbed += event.absorbed || 0;
          lastHeal.overheal += event.overheal || 0;
        } else {
          const heal = {
            event,
            amount: event.amount,
            absorbed: event.absorbed || 0,
            overheal: event.overheal || 0,
            count: 1,
          };
          results.push(heal);
          lastHeal = heal;
        }
      }
      return results;
    }, []);
  }

  calculateHealingStatistics(cooldown) {
    let healingDone = 0;
    let overhealingDone = 0;
    cooldown.events
      .filter((event) => event.type === EventType.Heal || event.type === EventType.Absorbed)
      .forEach((event) => {
        healingDone += event.amount + (event.absorbed || 0);
        overhealingDone += event.overheal || 0;
      });

    return {
      healingDone,
      overhealingDone,
    };
  }

  calculateDamageStatistics(cooldown) {
    const damageDone = cooldown.events.reduce(
      (acc, event) =>
        event.type === EventType.Damage ? acc + ((event.amount || 0) + (event.absorbed || 0)) : acc,
      0,
    );

    return { damageDone };
  }

  formatRelativeTimestamp(event, cooldown) {
    const relativeTimestamp = event.timestamp - cooldown.cdStart;
    return (relativeTimestamp > 0 ? '+' : '') + (relativeTimestamp / 1000).toFixed(3);
  }

  render() {
    const { cooldown, fightStart, fightEnd } = this.props;

    const fakeSummaryCooldown = { events: cooldown.lateEvents ?? [] };

    let healingStatistics = null;
    let extendedHealingStatistics = null;

    const start = cooldown.start;
    const cdStart = cooldown.cdStart;
    const end = cooldown.end || fightEnd;

    /* eslint-disable no-script-url */
    /* eslint-disable jsx-a11y/anchor-is-valid */
    return (
      <>
        <article>
          <figure>
            {(cooldown.spell && <SpellIcon spell={cooldown.spell} />) || (
              <div style={{ width: '60px' }} />
            )}
          </figure>
          <div className="row" style={{ width: '100%' }}>
            <div className={this.state.showAllEvents ? 'col-md-12' : 'col-md-6'}>
              <header style={{ marginTop: 5, fontSize: '1.25em', marginBottom: '.1em' }}>
                {(cooldown.spell && <SpellLink spell={cooldown.spell} icon={false} />) || (
                  <span>Remaining HoT duration</span>
                )}{' '}
                (
                <MaybeTooltip content={cooldown.durationTooltip}>
                  {formatDuration(cdStart - fightStart)} -&gt; {formatDuration(end - fightStart)}
                </MaybeTooltip>
                ) &nbsp;
                <TooltipElement
                  content={
                    <Trans id="shared.cooldownThroughputTracker.cooldown.events.tooltip">
                      Filter events to the cooldown window.
                    </Trans>
                  }
                >
                  <a
                    href="#"
                    onClick={() => this.props.applyTimeFilter(start - fightStart, end - fightStart)}
                  >
                    <Trans id="shared.cooldownThroughputTracker.cooldown.events">
                      Filter events
                    </Trans>
                  </a>
                </TooltipElement>
              </header>

              {!this.state.showCastEvents && (
                <div>
                  <div className="row">
                    <div className="col-xs-12">
                      {cooldown.events
                        .filter(
                          (event) => event.type === EventType.Cast && event.ability.guid !== 1,
                        )
                        .map((event, i) => (
                          <SpellLink
                            key={`${event.ability.guid}-${event.timestamp}-${i}`}
                            spell={event.ability.guid}
                            icon={false}
                          >
                            <Icon
                              icon={event.ability.abilityIcon}
                              alt={event.ability.name}
                              style={{ height: 23, marginRight: 4 }}
                            />
                          </SpellLink>
                        ))}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-xs-12">
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a href="#" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>
                        <Trans id="shared.cooldownThroughputTracker.cooldown.expand">More</Trans>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {this.state.showCastEvents && !this.state.showAllEvents && (
                <div className="container-fluid">
                  {cooldown.events
                    .filter((event) => event.type === EventType.Cast && event.ability.guid !== 1)
                    .map((event, i) => (
                      <div className="row" key={i}>
                        <div className="col-xs-2 text-right" style={{ padding: 0 }}>
                          {this.formatRelativeTimestamp(event, cooldown)}
                        </div>
                        <div className="col-xs-10">
                          <SpellLink
                            key={`${event.ability.guid}-${event.timestamp}-${i}`}
                            spell={event.ability.guid}
                            icon={false}
                          >
                            <Icon
                              icon={event.ability.abilityIcon}
                              alt={event.ability.name}
                              style={{ height: 23, marginRight: 4 }}
                            />{' '}
                            {event.ability.name}
                          </SpellLink>
                        </div>
                      </div>
                    ))}
                  <div className="row">
                    <div className="col-xs-12">
                      <a href="#" onClick={this.handleShowHealsClick} style={{ marginTop: '.2em' }}>
                        <Trans id="shared.cooldownThroughputTracker.cooldown.expand.again">
                          Even more
                        </Trans>
                      </a>
                      {' | '}
                      {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                      <a href="#" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>
                        <Trans id="shared.cooldownThroughputTracker.cooldown.shrink">
                          Show less
                        </Trans>
                      </a>
                      {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                    </div>
                  </div>
                </div>
              )}
              {this.state.showCastEvents && this.state.showAllEvents && (
                <div className="container-fluid">
                  {this.groupHeals(
                    cooldown.events.filter(
                      (event) =>
                        (event.type === EventType.Cast || event.type === EventType.Heal) &&
                        event.ability.guid !== 1,
                    ),
                  ).map((heal, i) => {
                    const event = heal.event || heal;
                    return (
                      <div className="row" key={i}>
                        <div className="col-xs-1 text-right" style={{ padding: 0 }}>
                          {this.formatRelativeTimestamp(event, cooldown)}
                        </div>
                        <div
                          className={`col-xs-4 ${
                            event.type === EventType.Heal ? 'col-xs-offset-1' : ''
                          }`}
                        >
                          <SpellLink
                            key={`${event.ability.guid}-${event.timestamp}-${i}`}
                            spell={event.ability.guid}
                            icon={false}
                          >
                            <Icon
                              icon={event.ability.abilityIcon}
                              alt={event.ability.name}
                              style={{ height: 23, marginRight: 4 }}
                            />{' '}
                            {event.ability.name}
                          </SpellLink>
                          {event.type === EventType.Heal && (
                            <span>
                              <span className="grouped-heal-meta amount"> x {heal.count}</span>
                            </span>
                          )}
                        </div>
                        {event.type === EventType.Heal && (
                          <div className="col-xs-4">
                            <span className="grouped-heal-meta healing">
                              {' '}
                              +{formatThousands(heal.amount + heal.absorbed)}
                            </span>
                            <span className="grouped-heal-meta overhealing">
                              {' '}
                              (O: {formatThousands(heal.overheal)})
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <a href="#" onClick={this.handleShowHealsClick} style={{ marginTop: '.2em' }}>
                    <Trans id="shared.cooldownThroughputTracker.cooldown.shrink">Show less</Trans>
                  </a>
                  {' | '}
                  {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                  <a href="#" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>
                    <Trans id="shared.cooldownThroughputTracker.cooldown.simple">Show simple</Trans>
                  </a>
                  {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                </div>
              )}
            </div>
            {!this.state.showAllEvents && (
              <div className="col-md-6">
                <div className="row">
                  {cooldown.summary.map((item) => {
                    switch (item) {
                      case BUILT_IN_SUMMARY_TYPES.HEALING:
                        healingStatistics =
                          healingStatistics || this.calculateHealingStatistics(cooldown);
                        return (
                          <div className="col-md-4 text-center" key="healing">
                            <div style={{ fontSize: '2em' }}>
                              {formatNumber(healingStatistics.healingDone)}
                            </div>
                            <TooltipElement
                              content={
                                <Trans id="shared.cooldownThroughputTracker.cooldown.healing.tooltip">
                                  This includes all healing that occurred while the buff was up,
                                  even if it was not triggered by spells cast inside the buff
                                  duration. Any delayed healing such as HOTs, Absorbs and Atonements
                                  will stop contributing to the healing done when the cooldown buff
                                  expires, so this value is lower for any specs with such abilities.
                                </Trans>
                              }
                            >
                              <Trans id="shared.cooldownThroughputTracker.cooldown.healing">
                                healing (
                                {formatNumber(
                                  (healingStatistics.healingDone / (end - start)) * 1000,
                                )}{' '}
                                HPS)
                              </Trans>
                            </TooltipElement>
                          </div>
                        );
                      case BUILT_IN_SUMMARY_TYPES.OVERHEALING:
                        healingStatistics =
                          healingStatistics || this.calculateHealingStatistics(cooldown);
                        return (
                          <div className="col-md-4 text-center" key="overhealing">
                            <div style={{ fontSize: '2em' }}>
                              {formatPercentage(
                                healingStatistics.overhealingDone /
                                  (healingStatistics.healingDone +
                                    healingStatistics.overhealingDone),
                              )}
                              %
                            </div>
                            <TooltipElement
                              content={
                                <Trans id="shared.cooldownThroughputTracker.cooldown.overhealing.tooltip">
                                  This includes all healing that occurred while the buff was up,
                                  even if it was not triggered by spells cast inside the buff
                                  duration. Any delayed healing such as HOTs, Absorbs and Atonements
                                  will stop contributing to the healing done when the cooldown buff
                                  expires, so this value is lower for any specs with such abilities.
                                </Trans>
                              }
                            >
                              <Trans id="shared.cooldownThroughputTracker.cooldown.overhealing">
                                overhealing
                              </Trans>
                            </TooltipElement>
                          </div>
                        );
                      case BUILT_IN_SUMMARY_TYPES.ABSORBED: {
                        const total = cooldown.events
                          .filter((event) => event.type === EventType.Absorbed)
                          .reduce((total, event) => total + (event.amount || 0), 0);
                        return (
                          <div className="col-md-4 text-center" key="absorbed">
                            <div style={{ fontSize: '2em' }}>{formatNumber(total)}</div>
                            <TooltipElement
                              content={
                                <Trans id="shared.cooldownThroughputTracker.cooldown.absorbed.tooltip">
                                  This includes all damage absorbed that occurred while the buff was
                                  up, even if it was not triggered by spells cast inside the buff
                                  duration.
                                </Trans>
                              }
                            >
                              <Trans id="shared.cooldownThroughputTracker.cooldown.absorbed">
                                damage absorbed
                              </Trans>
                            </TooltipElement>
                          </div>
                        );
                      }
                      case BUILT_IN_SUMMARY_TYPES.ABSORBS_APPLIED: {
                        const total = cooldown.events
                          .filter((event) => event.type === EventType.ApplyBuff)
                          .reduce((total, event) => total + (event.absorb || 0), 0);
                        return (
                          <div className="col-md-4 text-center" key="absorbs-applied">
                            <div style={{ fontSize: '2em' }}>{formatNumber(total)}</div>
                            <TooltipElement
                              content={
                                <Trans id="shared.cooldownThroughputTracker.cooldown.absorbApplied.tooltip">
                                  The total amount of absorb shields applied during the buff.
                                </Trans>
                              }
                            >
                              <Trans id="shared.cooldownThroughputTracker.cooldown.absorbApplied">
                                absorb applied
                              </Trans>
                            </TooltipElement>
                          </div>
                        );
                      }
                      case BUILT_IN_SUMMARY_TYPES.MANA: {
                        let manaUsed = 0;
                        if (cooldown.spell === SPELLS.INNERVATE.id) {
                          manaUsed = cooldown.events
                            .filter((event) => event.type === EventType.Cast)
                            .reduce(
                              (total, event) =>
                                total + (event.rawResourceCost[RESOURCE_TYPES.MANA.id] || 0),
                              0,
                            );
                        } else {
                          manaUsed = cooldown.events
                            .filter((event) => event.type === EventType.Cast)
                            .reduce(
                              (total, event) =>
                                total + (event.resourceCost[RESOURCE_TYPES.MANA.id] || 0),
                              0,
                            );
                        }
                        return (
                          <div>
                            <Trans
                              id="shared.cooldownThroughputTracker.cooldown.manaUsed"
                              className="col-md-4 text-center"
                              key="mana"
                            >
                              <div style={{ fontSize: '2em' }}>{formatNumber(manaUsed)}</div>
                              mana used
                            </Trans>
                          </div>
                        );
                      }
                      case BUILT_IN_SUMMARY_TYPES.DAMAGE: {
                        const damageStatistics = this.calculateDamageStatistics(cooldown);
                        return (
                          <div className="col-md-4 text-center" key="damage">
                            <div style={{ fontSize: '2em' }}>
                              {formatNumber(damageStatistics.damageDone)}
                            </div>
                            <TooltipElement
                              content={
                                <Trans id="shared.cooldownThroughputTracker.cooldown.damageDone.tooltip">
                                  This number represents the total amount of damage done during the
                                  duration of this cooldown, any damage done by DOTs after the
                                  effect of this cooldown has exprired will not be included in this
                                  statistic.
                                </Trans>
                              }
                            >
                              <Trans id="shared.cooldownThroughputTracker.cooldown.damageDone">
                                damage (
                                {formatNumber((damageStatistics.damageDone / (end - start)) * 1000)}{' '}
                                DPS)
                              </Trans>
                            </TooltipElement>
                          </div>
                        );
                      }
                      default:
                        // Custom
                        return (
                          <div className="col-md-4 text-center" key={item.label}>
                            <div style={{ fontSize: '2em' }}>
                              {typeof item.value === 'string'
                                ? item.value
                                : formatNumber(item.value)}
                            </div>
                            <TooltipElement content={item.tooltip}>{item.label}</TooltipElement>
                          </div>
                        );
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        </article>
        {cooldown.lateEvents && cooldown.lateEvents.length > 0 && (
          <>
            <hr />
            <article style={{ filter: 'grayscale(80%)' }}>
              <figure style={{ visibility: 'hidden' }}>
                <SpellIcon spell={cooldown.spell} />
              </figure>
              <div className="row" style={{ width: '100%' }}>
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-12">
                      <header style={{ marginTop: 5, fontSize: '1.25em', marginBottom: '.1em' }}>
                        Remaining HoT Duration ({formatDuration(end - fightStart)} -&gt;{' '}
                        {formatDuration(
                          cooldown.lateEvents[cooldown.lateEvents.length - 1].timestamp -
                            fightStart,
                        )}
                        )
                      </header>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      {cooldown.lateEvents
                        .filter(
                          (event) => event.type === EventType.Cast && event.ability.guid !== 1,
                        )
                        .map((event, i) => (
                          <SpellLink
                            key={`${event.ability.guid}-${event.timestamp}-${i}`}
                            spell={event.ability.guid}
                            icon={false}
                          >
                            <Icon
                              icon={event.ability.abilityIcon}
                              alt={event.ability.name}
                              style={{ height: 23, marginRight: 4 }}
                            />
                          </SpellLink>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="row">
                    {cooldown.summary.map((item) => {
                      switch (item) {
                        case BUILT_IN_SUMMARY_TYPES.HEALING:
                          extendedHealingStatistics =
                            extendedHealingStatistics ||
                            this.calculateHealingStatistics(fakeSummaryCooldown);
                          return (
                            <div className="col-md-4 text-center" key="healing">
                              <div style={{ fontSize: '2em' }}>
                                {formatNumber(extendedHealingStatistics.healingDone)}
                              </div>
                              <TooltipElement
                                content={
                                  <Trans id="shared.cooldownThroughputTracker.cooldown.healing.tooltip">
                                    This includes all healing that occurred while the buff was up,
                                    even if it was not triggered by spells cast inside the buff
                                    duration. Any delayed healing such as HOTs, Absorbs and
                                    Atonements will stop contributing to the healing done when the
                                    cooldown buff expires, so this value is lower for any specs with
                                    such abilities.
                                  </Trans>
                                }
                              >
                                <Trans id="shared.cooldownThroughputTracker.cooldown.healing">
                                  healing (
                                  {formatNumber(
                                    (extendedHealingStatistics.healingDone / (end - start)) * 1000,
                                  )}{' '}
                                  HPS)
                                </Trans>
                              </TooltipElement>
                            </div>
                          );
                        case BUILT_IN_SUMMARY_TYPES.OVERHEALING:
                          extendedHealingStatistics =
                            extendedHealingStatistics ||
                            this.calculateHealingStatistics(fakeSummaryCooldown);
                          return (
                            <div className="col-md-4 text-center" key="overhealing">
                              <div style={{ fontSize: '2em' }}>
                                {formatPercentage(
                                  extendedHealingStatistics.overhealingDone /
                                    (extendedHealingStatistics.healingDone +
                                      extendedHealingStatistics.overhealingDone),
                                )}
                                %
                              </div>
                              <TooltipElement
                                content={
                                  <Trans id="shared.cooldownThroughputTracker.cooldown.overhealing.tooltip">
                                    This includes all healing that occurred while the buff was up,
                                    even if it was not triggered by spells cast inside the buff
                                    duration. Any delayed healing such as HOTs, Absorbs and
                                    Atonements will stop contributing to the healing done when the
                                    cooldown buff expires, so this value is lower for any specs with
                                    such abilities.
                                  </Trans>
                                }
                              >
                                <Trans id="shared.cooldownThroughputTracker.cooldown.overhealing">
                                  overhealing
                                </Trans>
                              </TooltipElement>
                            </div>
                          );
                        case BUILT_IN_SUMMARY_TYPES.ABSORBED: {
                          const total = fakeSummaryCooldown.events
                            .filter((event) => event.type === EventType.Absorbed)
                            .reduce((total, event) => total + (event.amount || 0), 0);
                          return (
                            <div className="col-md-4 text-center" key="absorbed">
                              <div style={{ fontSize: '2em' }}>{formatNumber(total)}</div>
                              <TooltipElement
                                content={
                                  <Trans id="shared.cooldownThroughputTracker.cooldown.absorbed.tooltip">
                                    This includes all damage absorbed that occurred while the buff
                                    was up, even if it was not triggered by spells cast inside the
                                    buff duration.
                                  </Trans>
                                }
                              >
                                <Trans id="shared.cooldownThroughputTracker.cooldown.absorbed">
                                  damage absorbed
                                </Trans>
                              </TooltipElement>
                            </div>
                          );
                        }
                        case BUILT_IN_SUMMARY_TYPES.ABSORBS_APPLIED: {
                          const total = fakeSummaryCooldown.events
                            .filter((event) => event.type === EventType.ApplyBuff)
                            .reduce((total, event) => total + (event.absorb || 0), 0);
                          return (
                            <div className="col-md-4 text-center" key="absorbs-applied">
                              <div style={{ fontSize: '2em' }}>{formatNumber(total)}</div>
                              <TooltipElement
                                content={
                                  <Trans id="shared.cooldownThroughputTracker.cooldown.absorbApplied.tooltip">
                                    The total amount of absorb shields applied during the buff.
                                  </Trans>
                                }
                              >
                                <Trans id="shared.cooldownThroughputTracker.cooldown.absorbApplied">
                                  absorb applied
                                </Trans>
                              </TooltipElement>
                            </div>
                          );
                        }
                        case BUILT_IN_SUMMARY_TYPES.MANA: {
                          let manaUsed = 0;
                          if (cooldown.spell === SPELLS.INNERVATE.id) {
                            manaUsed = fakeSummaryCooldown.events
                              .filter((event) => event.type === EventType.Cast)
                              .reduce(
                                (total, event) =>
                                  total + (event.rawResourceCost[RESOURCE_TYPES.MANA.id] || 0),
                                0,
                              );
                          } else {
                            manaUsed = fakeSummaryCooldown.events
                              .filter((event) => event.type === EventType.Cast)
                              .reduce(
                                (total, event) =>
                                  total + (event.resourceCost[RESOURCE_TYPES.MANA.id] || 0),
                                0,
                              );
                          }
                          return (
                            <div>
                              <Trans
                                id="shared.cooldownThroughputTracker.cooldown.manaUsed"
                                className="col-md-4 text-center"
                                key="mana"
                              >
                                <div style={{ fontSize: '2em' }}>{formatNumber(manaUsed)}</div>
                                mana used
                              </Trans>
                            </div>
                          );
                        }
                        case BUILT_IN_SUMMARY_TYPES.DAMAGE: {
                          const damageStatistics =
                            this.calculateDamageStatistics(fakeSummaryCooldown);
                          return (
                            <div className="col-md-4 text-center" key="damage">
                              <div style={{ fontSize: '2em' }}>
                                {formatNumber(damageStatistics.damageDone)}
                              </div>
                              <TooltipElement
                                content={
                                  <Trans id="shared.cooldownThroughputTracker.cooldown.damageDone.tooltip">
                                    This number represents the total amount of damage done during
                                    the duration of this cooldown, any damage done by DOTs after the
                                    effect of this cooldown has exprired will not be included in
                                    this statistic.
                                  </Trans>
                                }
                              >
                                <Trans id="shared.cooldownThroughputTracker.cooldown.damageDone">
                                  damage (
                                  {formatNumber(
                                    (damageStatistics.damageDone / (end - start)) * 1000,
                                  )}{' '}
                                  DPS)
                                </Trans>
                              </TooltipElement>
                            </div>
                          );
                        }
                        default:
                          // Custom
                          return (
                            <div className="col-md-4 text-center" key={item.label}>
                              <div style={{ fontSize: '2em' }}>
                                {typeof item.value === 'string'
                                  ? item.value
                                  : formatNumber(item.value)}
                              </div>
                              <TooltipElement content={item.tooltip}>{item.label}</TooltipElement>
                            </div>
                          );
                      }
                    })}
                  </div>
                </div>
              </div>
            </article>
          </>
        )}
      </>
    );
  }
}

export default Cooldown;
