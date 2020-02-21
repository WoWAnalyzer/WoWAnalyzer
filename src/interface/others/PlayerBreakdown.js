import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

import SPECS from 'game/SPECS';
import SpecIcon from 'common/SpecIcon';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import indexByProperty from 'common/indexByProperty';
import Toggle from 'react-toggle';
import SpellLink from 'common/SpellLink';
import PerformanceBar from 'interface/PerformanceBar';

class PlayerBreakdown extends React.Component {
  static propTypes = {
    report: PropTypes.object.isRequired,
    spellreport: PropTypes.object,
    players: PropTypes.array.isRequired,
  };
  state = {
    showPlayers: true,
  };

  calculatePlayerBreakdown(statsByTargetId, players) {
    const friendlyStats = [];
    const playersById = indexByProperty(players, 'id');
    Object.keys(statsByTargetId)
      .forEach(targetId => {
        const playerStats = statsByTargetId[targetId];
        const playerInfo = playersById[targetId];

        if (playerInfo) {
          friendlyStats.push({
            ...playerInfo,
            ...playerStats,
            masteryEffectiveness: playerStats.healingFromMastery / (playerStats.maxPotentialHealingFromMastery || 1),
          });
        }
      });

    return friendlyStats;
  }

  calculateSpellBreakdown(statsBySpellId) {
    const spellStats = [];
    Object.keys(statsBySpellId)
      .forEach(spellId => {
        const spell = statsBySpellId[spellId];

        spellStats.push({
          ...spell,
          masteryEffectiveness: spell.healingFromMastery / (spell.maxPotentialHealingFromMastery || 1),
        });
      });

    return spellStats;
  }

  render() {
    const { report, spellreport, players } = this.props;

    const friendlyStats = this.calculatePlayerBreakdown(report, players);
    const totalEffectiveHealing = Object.values(report).reduce((sum, player) => sum + player.effectiveHealing, 0);
    const highestEffectiveHealing = friendlyStats.reduce((highest, player) => Math.max(highest, player.effectiveHealing), 1);
    const highestMasteryEffectiveness = friendlyStats.reduce((highest, player) => Math.max(highest, player.masteryEffectiveness), 0);

    let spellStats = [];
    let totalSpellEffectiveHealing = 0;
    let highestSpellEffectiveHealing = 0;
    let highestSpellMasteryEffectiveness = 0;
    if (spellreport) {
      spellStats = this.calculateSpellBreakdown(spellreport);
      totalSpellEffectiveHealing = Object.values(spellreport).reduce((sum, spell) => sum + spell.effectiveHealing, 0);
      highestSpellEffectiveHealing = spellStats.reduce((highest, spell) => Math.max(highest, spell.effectiveHealing), 1);
      highestSpellMasteryEffectiveness = spellStats.reduce((highest, spell) => Math.max(highest, spell.masteryEffectiveness), 0);
    }

    return (
      <>
        {spellreport &&
          <div className="pad">
            <div className="pull-right">
              <div className="toggle-control pull-left" style={{ marginLeft: '.5em' }}>
                <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em', marginRight: '1em' }}>
                  Spells
                </label>
                <Toggle
                  defaultChecked
                  icons={false}
                  onChange={event => this.setState({ showPlayers: event.target.checked })}
                  id="healing-toggle"
                />
                <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em' }}>
                  Players
              </label>
              </div>
            </div>
          </div>
        }
        <table className="data-table">
          <thead>
            <tr style={{ textTransform: 'uppercase' }}>
              <th><Trans>Name</Trans></th>
              <th colSpan="2"><Trans>Mastery effectiveness</Trans></th>
              <th colSpan="3"><TooltipElement content={<Trans>This is the amount of healing done by spells affected by mastery. Things like Holy Paladin beacons or Restoration Shaman feeding are NOT included.</Trans>}><Trans>Healing done</Trans></TooltipElement></th>
            </tr>
          </thead>
          <tbody>
            {!this.state.showPlayers && spellStats && spellStats
              .sort((a, b) => b.masteryEffectiveness - a.masteryEffectiveness)
              .map((spell) => {
                // We want the performance bar to show a full bar for whatever healing done percentage is highest to make
                // it easier to see relative amounts.
                const performanceBarMasteryEffectiveness = spell.masteryEffectiveness / highestSpellMasteryEffectiveness;
                const performanceBarHealingDonePercentage = spell.effectiveHealing / highestSpellEffectiveHealing;
                const actualHealingDonePercentage = spell.effectiveHealing / totalSpellEffectiveHealing;

                return (
                  <tr key={spell.spellId}>
                    <td style={{ width: '20%' }}>
                      <SpellLink id={spell.spellId} />
                    </td>
                    <td style={{ width: 50, textAlign: 'right' }}>
                      {(Math.round(spell.masteryEffectiveness * 10000) / 100).toFixed(2)}%
                  </td>
                    <td style={{ width: '40%' }}>
                      <PerformanceBar percent={performanceBarMasteryEffectiveness} />
                    </td>
                    <td style={{ width: 50, textAlign: 'right' }}>
                      {(Math.round(actualHealingDonePercentage * 10000) / 100).toFixed(2)}%
                  </td>
                    <td style={{ width: '40%' }}>
                      <PerformanceBar percent={performanceBarHealingDonePercentage} />
                    </td>
                    <td style={{ width: 50, textAlign: 'right' }}>
                      {(formatNumber(spell.effectiveHealing))}
                    </td>
                  </tr>
                );
              })}
            {this.state.showPlayers && friendlyStats && friendlyStats
              .sort((a, b) => b.masteryEffectiveness - a.masteryEffectiveness)
              .map((player) => {
                const combatant = player.combatant;
                if (!combatant) {
                  console.error('Missing combatant:', player);
                  return null; // pet or something
                }
                const spec = SPECS[combatant.specId];
                const specClassName = spec.className.replace(' ', '');
                // We want the performance bar to show a full bar for whatever healing done percentage is highest to make
                // it easier to see relative amounts.
                const performanceBarMasteryEffectiveness = player.masteryEffectiveness / highestMasteryEffectiveness;
                const performanceBarHealingReceivedPercentage = player.effectiveHealing / highestEffectiveHealing;
                const actualHealingReceivedPercentage = player.effectiveHealing / totalEffectiveHealing;

                return (
                  <tr key={combatant.id}>
                    <td style={{ width: '20%' }}>
                      <SpecIcon id={spec.id} />{' '}
                      {combatant.name}
                    </td>
                    <td style={{ width: 50, textAlign: 'right' }}>
                      {(Math.round(player.masteryEffectiveness * 10000) / 100).toFixed(2)}%
                    </td>
                    <td style={{ width: '40%' }}>
                      <div className="flex performance-bar-container">
                        <div
                          className={`flex-sub performance-bar ${specClassName}-bg`}
                          style={{ width: `${performanceBarMasteryEffectiveness * 100}%` }}
                        />
                      </div>
                    </td>
                    <td style={{ width: 50, textAlign: 'right' }}>
                      {(Math.round(actualHealingReceivedPercentage * 10000) / 100).toFixed(2)}%
                    </td>
                    <td style={{ width: '40%' }}>
                      <div className="flex performance-bar-container">
                        <div
                          className={`flex-sub performance-bar ${specClassName}-bg`}
                          style={{ width: `${performanceBarHealingReceivedPercentage * 100}%` }}
                        />
                      </div>
                    </td>
                    <td style={{ width: 50, textAlign: 'right' }}>
                      {(formatNumber(player.effectiveHealing))}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </>
    );
  }
}

export default PlayerBreakdown;
