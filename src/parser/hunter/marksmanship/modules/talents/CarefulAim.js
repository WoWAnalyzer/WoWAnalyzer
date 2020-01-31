import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatDuration, formatNumber } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const HIGHER_HP_THRESHOLD = 0.8;
const LOWER_HP_THRESHOLD = 0.2;
const CA_MODIFIER = .5;

/**
 * Aimed Shot deals 50% bonus damage to targets who are above 80% health or below 20% health.
 *
 * Example log: https://www.warcraftlogs.com/reports/aqRc7Fnvf2dmPMD3#fight=75&type=damage-done
 */
class CarefulAim extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    enemies: Enemies,
  };

  caProcs = 0;
  damageContribution = 0;
  bossIDs = [];
  carefulAimPeriods = {
    /*
    [bossID]: {
          bossName: name,
          caDamage: 0,
          aimedShotsInCA: count,
          timestampSub100: timestamp,
          timestampSub80: timestamp,
          timestampSub20: timestamp,
          timestampDead: timestamp,
          },
        };
     */
    'others': {
      bossName: 'Adds',
      caDamage: 0,
      aimedShotsInCA: 0,
      timestampSub100: null,
      timestampSub80: null,
      timestampSub20: null,
      timestampDead: null,
    },
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CAREFUL_AIM_TALENT.id);
    this.owner.report.enemies.forEach(enemy => {
      enemy.fights.forEach(fight => {
        if (fight.id === this.owner.fight.id && enemy.type === 'Boss') this.bossIDs.push(enemy.id);
      });
    });
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const healthPercent = event.hitPoints / event.maxHitPoints;
    const targetID = event.targetID;
    let target;
    const outsideCarefulAim = healthPercent < HIGHER_HP_THRESHOLD && healthPercent > LOWER_HP_THRESHOLD; //True if target is below 80% and above 20%
    if (event.maxHitPoints && this.bossIDs.includes(targetID)) {
      target = targetID;
      if (!this.carefulAimPeriods[target]) {
        const enemy = this.enemies.getEntity(event);
        this.carefulAimPeriods[target] = {
          bossName: enemy.name,
          caDamage: 0,
          aimedShotsInCA: 0,
          timestampSub100: null,
          timestampSub80: null,
          timestampSub20: null,
          timestampDead: null,
        };
      }
      if (healthPercent && healthPercent > HIGHER_HP_THRESHOLD) {
        this.carefulAimPeriods[target].timestampSub100 = this.carefulAimPeriods[target].timestampSub100 || event.timestamp;
      }
      if (healthPercent && outsideCarefulAim) {
        this.carefulAimPeriods[target].timestampSub80 = this.carefulAimPeriods[target].timestampSub80 || event.timestamp;
      }
      if (healthPercent && healthPercent < LOWER_HP_THRESHOLD) {
        this.carefulAimPeriods[target].timestampSub20 = this.carefulAimPeriods[target].timestampSub20 || event.timestamp;
      }
    } else {
      target = 'others';
    }
    if (spellId !== SPELLS.AIMED_SHOT.id || outsideCarefulAim) {
      return;
    }
    const damageFromCA = calculateEffectiveDamage(event, CA_MODIFIER);
    if (this.carefulAimPeriods[target]) {
      this.carefulAimPeriods[target].caDamage += damageFromCA;
      this.carefulAimPeriods[target].aimedShotsInCA += 1;
    } else {
      this.carefulAimPeriods.others.caDamage += damageFromCA;
      this.carefulAimPeriods.others.aimedShotsInCA += 1;
    }
    this.caProcs += 1;
    this.damageContribution += damageFromCA;
  }

  on_fightend() {
    Object.values(this.carefulAimPeriods).forEach(boss => {
      boss.timestampSub100 = boss.timestampSub100 || this.owner.fight.start_time;
      boss.timestampDead = boss.timestampDead || this.owner.fight.end_time;
    });
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
        tooltip={(
          <>
            Total damage contribution: {formatNumber(this.damageContribution)}
          </>
        )}
        dropdown={(
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Boss</th>
                  <th>Dmg</th>
                  <th>Hits</th>
                  <th>Dur</th>
                  <th>Interval</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.carefulAimPeriods).map((boss, index) => (
                  <tr key={index}>
                    <td>{boss.bossName}</td>
                    <td>{formatNumber(boss.caDamage)}</td>
                    <td>{boss.aimedShotsInCA}</td>
                    <td>{boss.bossName === 'Adds' ?
                      'N/A' :
                      formatDuration((boss.timestampSub80 - boss.timestampSub100 + boss.timestampDead - boss.timestampSub20) / 1000)}</td>
                    <td>{(boss.bossName === 'Adds' ?
                      this.owner.fightDuration / 1000 / boss.aimedShotsInCA :
                      (boss.timestampSub80 - boss.timestampSub100 + boss.timestampDead - boss.timestampSub20) / 1000 / boss.aimedShotsInCA).toFixed(1)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.CAREFUL_AIM_TALENT}>
          <>
            {this.caProcs} <small>hits for</small> ~{formatNumber(this.damageContribution / this.caProcs)} <small>each</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CarefulAim;
