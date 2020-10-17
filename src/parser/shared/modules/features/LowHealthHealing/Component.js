import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import SPECS from 'game/SPECS';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';

import { formatNumber, formatPercentage, formatDuration } from 'common/format';
import SpecIcon from 'common/SpecIcon';
import { TooltipElement } from 'common/Tooltip';
import { Trans } from '@lingui/macro';

class LowHealthHealing extends React.Component {
  static propTypes = {
    healEvents: PropTypes.array.isRequired,
    fightStart: PropTypes.number.isRequired,
    combatants: PropTypes.object.isRequired,
  };
  state = {
    maxPlayerHealthPercentage: 0.35,
    minHealOfMaxHealthPercentage: 0.1,
  };

  render() {
    const { fightStart, combatants, healEvents } = this.props;

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
          <Trans id="shared.lowHealthHealing.slider.maxHealth">Max health of target:</Trans> <Slider
            {...sliderProps}
            defaultValue={this.state.maxPlayerHealthPercentage}
            onChange={(value) => {
              this.setState({
                maxPlayerHealthPercentage: value,
              });
            }}
          /><br />
          <Trans id="shared.lowHealthHealing.slider.minEffective">Min effective healing (percentage of target's health):</Trans> <Slider
            {...sliderProps}
            defaultValue={this.state.minHealOfMaxHealthPercentage}
            onChange={(value) => {
              this.setState({
                minHealOfMaxHealthPercentage: value,
              });
            }}
          />
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th><Trans id="common.time">Time</Trans></th>
              <th><Trans id="common.ability">Ability</Trans></th>
              <th><Trans id="common.target">Target</Trans></th>
              <th colSpan="2"><Trans id="common.healingDone">Healing done</Trans></th>
            </tr>
          </thead>
          <tbody>
            {
              healEvents
                .map(event => {
                  const effectiveHealing = event.amount + (event.absorbed || 0);
                  const hitPointsBeforeHeal = event.hitPoints - effectiveHealing;
                  const healthPercentage = hitPointsBeforeHeal / event.maxHitPoints;

                  if (healthPercentage > this.state.maxPlayerHealthPercentage) {
                    return false;
                  }
                  total += effectiveHealing;
                  count += 1;
                  if ((effectiveHealing / event.maxHitPoints) < this.state.minHealOfMaxHealthPercentage) {
                    return false;
                  }
                  bigHealCount += 1;
                  totalBigHealing += effectiveHealing;

                  const combatant = combatants.getEntity(event);
                  if (!combatant) {
                    console.error('Missing combatant for event:', event);
                    return null; // pet or something
                  }
                  const spec = SPECS[combatant.specId];
                  const specClassName = spec.className.replace(' ', '');

                  return (
                    <tr key={`${event.timestamp}${effectiveHealing}${hitPointsBeforeHeal}`}>
                      <td style={{ width: '5%' }}>
                        {formatDuration((event.timestamp - fightStart) / 1000)}
                      </td>
                      <td style={{ width: '25%' }}>
                        <SpellLink id={event.ability.guid} icon={false}>
                          <Icon icon={event.ability.abilityIcon} alt={event.ability.abilityIcon} /> {event.ability.name}
                        </SpellLink>
                      </td>
                      <td style={{ width: '20%' }} className={specClassName}>
                        <SpecIcon id={spec.id} />{' '}
                        {combatant.name}
                      </td>
                      <td style={{ width: 170, paddingRight: 5, textAlign: 'right' }}>
                        {formatNumber(effectiveHealing)} @{' '}
                        {healthPercentage < 0 ? (
                          <TooltipElement content={<Trans id="shared.lowHealthHealing.table.event.tooltip">This number may be negative when the player had an absorb larger than his health pool.</Trans>}>
                            <Trans id="shared.lowHealthHealing.table.event">{formatPercentage(healthPercentage)}% health</Trans>
                          </TooltipElement>
                        ) : <Trans id="shared.lowHealthHealing.table.event">{formatPercentage(healthPercentage)}% health</Trans>}
                      </td>
                      <td style={{ width: '35%' }}>
                        <div className="flex performance-bar-container">
                          <div
                            className={`flex-sub performance-bar ${specClassName}-bg`}
                            style={{ width: `${healthPercentage * 100}%` }}
                          />
                          <div
                            className="flex-sub performance-bar Hunter-bg"
                            style={{ width: `${effectiveHealing / event.maxHitPoints * 100}%`, opacity: 0.4 }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
            <tr>
              <td colSpan="7">
                <Trans id="shared.lowHealthHealing.table.total">Total healing done on targets below {(this.state.maxPlayerHealthPercentage * 100)}% health: {formatNumber(total)} (spread over {count} seperate heals).<br />
                Total healing done on targets below {(this.state.maxPlayerHealthPercentage * 100)}% health for more than {Math.round(this.state.minHealOfMaxHealthPercentage * 100)}% of target's max health: {formatNumber(totalBigHealing)} (spread over {bigHealCount} seperate heals).</Trans>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default LowHealthHealing;
