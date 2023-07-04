import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage, formatDuration } from 'common/format';
import { SpellLink } from 'interface';
import { SpecIcon } from 'interface';
import { TooltipElement } from 'interface';
import Combatant from 'parser/core/Combatant';
import { Ability, HealEvent } from 'parser/core/Events';
import Slider from 'rc-slider';
import * as React from 'react';
import 'rc-slider/assets/index.css';

import Combatants from '../../Combatants';

type LowHealthHealingProps = {
  fightStart: number;
  combatants: Combatants;
  healEvents: HealEvent[];
};

type LowHealthHealingState = {
  maxPlayerHealthPercentage: number;
  minHealOfMaxHealthPercentage: number;
};

interface ComboHealEvent {
  /** All abilities in Combo, even duplicates */
  abilities: Ability[];
  /** All HealEvents they are based off of */
  healEvents: HealEvent[];
  /** totalHeal from all HealEvents */
  totalEffectiveHeal: number;
  /** person who was healed */
  combatant: Combatant;
  /** HP before the heal */
  hitPointsBefore: number;
  /** Max HP for the combo */
  maxHitPoints: number;
  /** timestamp of first heal */
  timestamp: number;
}

const GROUPING_BUFFER = 100;

class LowHealthHealing extends React.PureComponent<LowHealthHealingProps, LowHealthHealingState> {
  state = {
    maxPlayerHealthPercentage: 0.35,
    minHealOfMaxHealthPercentage: 0.1,
  };

  makeComboEvents(events: HealEvent[], combatants: Combatants) {
    // first lets group by combatant to make timestamp grouping easier
    const mappy: Map<Combatant, HealEvent[]> = new Map<Combatant, HealEvent[]>();
    events.forEach((event) => {
      const combat = combatants.getEntity(event);
      if (combat === null) {
        return;
      }
      let array = mappy.get(combat);
      if (array === undefined) {
        array = [];
        mappy.set(combat, array);
      }
      array.push(event);
    });

    const comboMappy: Map<Combatant, ComboHealEvent[]> = new Map<Combatant, ComboHealEvent[]>();
    // next lets do the timestamp grouping easier
    mappy.forEach((value, key) => {
      let array = comboMappy.get(key);
      if (array === undefined) {
        array = [];
        comboMappy.set(key, array);
      }

      for (let outer = 0; outer < value.length; outer += 1) {
        const outerEvent = value[outer];

        const currentTimeStamp = outerEvent.timestamp;
        // small buffer for log weirdness far too low for another cast
        const upperRange = currentTimeStamp + GROUPING_BUFFER;

        // Simple math. First event is most important as it contains all the HP values we need
        const effectiveHealing = outerEvent.amount + (outerEvent.absorbed || 0);
        const hitPointsBeforeHeal = outerEvent.hitPoints - effectiveHealing;

        // set up baseline ComboHealEvent
        const currentCombo: ComboHealEvent = {
          abilities: [],
          healEvents: [],
          totalEffectiveHeal: 0,
          combatant: key,
          hitPointsBefore: hitPointsBeforeHeal, // this is never going to change
          maxHitPoints: outerEvent.maxHitPoints, // this will never change for this grouping, can change between ComboHealEvents
          timestamp: currentTimeStamp, // when did the first heal happen
        };

        array.push(currentCombo);
        // lets look into the future to see what to snag
        for (let inner = outer; inner < value.length; inner += 1) {
          const innerEvent = value[inner];
          if (innerEvent.timestamp > upperRange) {
            break;
          }

          currentCombo.abilities.push(innerEvent.ability);
          currentCombo.healEvents.push(innerEvent);
          currentCombo.totalEffectiveHeal += innerEvent.amount + (innerEvent.absorbed || 0);
          // lets jump to this point so we don't re-look at events
          outer = inner;
        }
      }
    });

    // time to reorder events again
    const reordered: ComboHealEvent[] = [];
    // add all events to array
    comboMappy.forEach((value) => {
      reordered.push(...value);
    });
    // sort by timestamp start of fight first
    reordered.sort((a, b) => a.timestamp - b.timestamp);
    return reordered;
  }

  render() {
    const { fightStart, combatants, healEvents } = this.props;

    const grouppedEvents = this.makeComboEvents(healEvents, combatants);

    let total = 0;
    let count = 0;
    let totalBigHealing = 0;
    let bigHealCount = 0;

    const sliderProps = {
      min: 0,
      max: 1,
      step: 0.05,
      marks: {
        0: '0%',
        0.1: '10%',
        0.2: '20%',
        0.3: '30%',
        0.4: '40%',
        0.5: '50%',
        0.6: '60%',
        0.7: '70%',
        0.8: '80%',
        0.9: '90%',
        1: '100%',
      },
      style: { marginBottom: '2em' },
    };

    return (
      <div>
        <div style={{ padding: '15px 30px' }}>
          <Trans id="shared.lowHealthHealing.slider.maxHealth">Max health of target:</Trans>{' '}
          <Slider
            {...sliderProps}
            defaultValue={this.state.maxPlayerHealthPercentage}
            onChange={(value: number | number[]) => {
              this.setState({
                maxPlayerHealthPercentage: value as number,
              });
            }}
          />
          <br />
          <Trans id="shared.lowHealthHealing.slider.minEffective">
            Min effective healing (percentage of target's health):
          </Trans>{' '}
          <Slider
            {...sliderProps}
            defaultValue={this.state.minHealOfMaxHealthPercentage}
            onChange={(value: number | number[]) => {
              this.setState({
                minHealOfMaxHealthPercentage: value as number,
              });
            }}
          />
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>
                <Trans id="common.time">Time</Trans>
              </th>
              <th>
                <Trans id="common.ability">Ability</Trans>
              </th>
              <th>
                <Trans id="common.target">Target</Trans>
              </th>
              <th colSpan={2}>
                <Trans id="common.healingDone">Healing done</Trans>
              </th>
            </tr>
          </thead>
          <tbody>
            {grouppedEvents.map((event) => {
              const effectiveHealing = event.totalEffectiveHeal;
              const healthPercentage = event.hitPointsBefore / event.maxHitPoints;

              if (healthPercentage > this.state.maxPlayerHealthPercentage) {
                return false;
              }

              total += effectiveHealing;
              count += 1;
              if (effectiveHealing / event.maxHitPoints < this.state.minHealOfMaxHealthPercentage) {
                return false;
              }

              bigHealCount += 1;
              totalBigHealing += effectiveHealing;

              const specClassName = event.combatant.player.type.replace(' ', '');

              return (
                <tr key={`${event.timestamp}${effectiveHealing}${event.hitPointsBefore}`}>
                  <td style={{ width: '5%' }}>{formatDuration(event.timestamp - fightStart)}</td>
                  <td style={{ width: '25%' }}>
                    {event.abilities.map((ability) => (
                      <div key={event.abilities.indexOf(ability)}>
                        <SpellLink spell={ability.guid} />
                      </div>
                    ))}
                  </td>
                  <td style={{ width: '20%' }} className={specClassName}>
                    <SpecIcon icon={event.combatant.player.icon} /> {event.combatant.name}
                  </td>
                  <td style={{ width: 170, paddingRight: 5, textAlign: 'right' }}>
                    {formatNumber(effectiveHealing)} @{' '}
                    {healthPercentage < 0 ? (
                      <TooltipElement
                        content={
                          <Trans id="shared.lowHealthHealing.table.event.tooltip">
                            This number may be negative when the player had an absorb larger than
                            his health pool.
                          </Trans>
                        }
                      >
                        <Trans id="shared.lowHealthHealing.table.event">
                          {formatPercentage(healthPercentage)}% health
                        </Trans>
                      </TooltipElement>
                    ) : (
                      <Trans id="shared.lowHealthHealing.table.event">
                        {formatPercentage(healthPercentage)}% health
                      </Trans>
                    )}
                  </td>
                  <td style={{ width: '35%' }}>
                    <div className="flex performance-bar-container">
                      <div
                        className={`flex-sub performance-bar ${specClassName}-bg`}
                        style={{ width: `${healthPercentage * 100}%` }}
                      />
                      <div
                        className="flex-sub performance-bar Hunter-bg"
                        style={{
                          width: `${(effectiveHealing / event.maxHitPoints) * 100}%`,
                          opacity: 0.4,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={7}>
                <Trans id="shared.lowHealthHealing.table.total">
                  Total healing done on targets below {this.state.maxPlayerHealthPercentage * 100}%
                  health: {formatNumber(total)} (spread over {count} seperate heals).
                  <br />
                  Total healing done on targets below {this.state.maxPlayerHealthPercentage * 100}%
                  health for more than {Math.round(this.state.minHealOfMaxHealthPercentage * 100)}%
                  of target's max health: {formatNumber(totalBigHealing)} (spread over{' '}
                  {bigHealCount} seperate heals).
                </Trans>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default LowHealthHealing;
