import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import SpellLink from 'common/SpellLink';
import Enemies from 'parser/shared/modules/Enemies';

import { findByBossId } from 'raids/index';
import StatisticBox from 'interface/others/StatisticBox';
import HIT_TYPES from 'game/HIT_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

const debug = false;

class MitigationCheck extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  checksPassedMap = new Map();
  checksFailedMap = new Map();

  checksPhysical = [];
  checksMagical = [];

  buffCheckPhysical = [];
  buffCheckMagical = [];
  buffCheckPhysAndMag = [];

  debuffCheckPhysical = [];
  debuffCheckMagical = [];
  debuffCheckPhysAndMag = [];

  constructor(...args) {
    super(...args);
    if (this.owner.boss == null) {
      this.active = false;
      return;
    }
    const boss = findByBossId(this.owner.boss.id);
    if (boss.fight.softMitigationChecks.physical && boss.fight.softMitigationChecks.magical) {
      this.checksPhysical = boss.fight.softMitigationChecks.physical;
      this.checksMagical = boss.fight.softMitigationChecks.magical;
      if (this.checksPhysical === undefined || this.checksMagical === undefined) {
        this.checksPhysical = [];
        this.checksMagical = [];
      }
    } else {
      this.checksPhysical = [];
      this.checksMagical = [];

      this.buffCheckPhysical = [];
      this.buffCheckMagical = [];
      this.buffCheckPhysAndMag = [];

      this.debuffCheckPhysical = [];
      this.debuffCheckMagical = [];
      this.debuffCheckPhysAndMag = [];
    }
    [...this.checksPhysical, ...this.checksMagical].forEach((e) => {
      this.checksPassedMap.set(e, 0);
      this.checksFailedMap.set(e, 0);
    });
  }

  on_toPlayer_damage(event) {
    const spell = event.ability.guid;
    const hitType = event.ability.type;
    let checks = [];
    let buffCheck = [];
    let debuffCheck = [];
    if (hitType === MAGIC_SCHOOLS.ids.PHYSICAL){
      checks = this.checksPhysical;
      buffCheck = [...this.buffCheckPhysical, ...this.buffCheckPhysAndMag];
      debuffCheck = [...this.debuffCheckPhysical, ...this.debuffCheckPhysAndMag];
    } else {
      checks = this.checksMagical;
      buffCheck = [...this.buffCheckMagical, ...this.buffCheckPhysAndMag];
      debuffCheck = [...this.debuffCheckMagical, ...this.debuffCheckPhysAndMag];
    }
    if (checks.includes(spell) && !event.tick) {
      debug && console.log(buffCheck);
      debug && console.log(debuffCheck);
      if (buffCheck.some((e) => this.selectedCombatant.hasBuff(e)) || event.hitType === HIT_TYPES.IMMUNE) {
        // pass checked if buff was up or the damage missed
        this.checksPassedMap.set(spell, this.checksPassedMap.get(spell) + 1);
      } else {
        const enemy = this.enemies.getEntities()[event.sourceID];
        //We want to get the source rather than the player's target, so no getEntity().
        if (enemy && debuffCheck.some((e) => enemy.hasBuff(e, event.timestamp))) {
          this.checksPassedMap.set(spell, this.checksPassedMap.get(spell) + 1);
        } else {
          this.checksFailedMap.set(spell, this.checksFailedMap.get(spell) + 1);
        }
      }
    }
  }

  get tooltip() {
    return [...this.buffCheckPhysical, ...this.buffCheckMagical, ...this.buffCheckPhysAndMag,
      ...this.debuffCheckPhysical, ...this.debuffCheckMagical, ...this.debuffCheckPhysAndMag].reduce((prev, curr) => {
      return prev + `<li>${SPELLS[curr].name}</li>`;
    }, 'Checks if one of the following buffs or debuffs were up during the mechanic: <ul>') + '</ul>';
  }

  get physicalChecks() {
    return this.checksPhysical.filter(spell => this.checksPassedMap.get(spell) + this.checksFailedMap.get(spell) > 0);
  }

  get magicalChecks() {
    return this.checksMagical.filter(spell => this.checksPassedMap.get(spell) + this.checksFailedMap.get(spell) > 0);
  }

  statistic() {
    const failSum = Array.from(this.checksFailedMap.values()).reduce((total, val) => total + val, 0);
    const passSum = Array.from(this.checksPassedMap.values()).reduce((total, val) => total + val, 0);
    if (failSum + passSum === 0) {
      return null;
    }
    const buffCheck = [...this.buffCheckPhysical, ...this.buffCheckMagical, ...this.buffCheckPhysAndMag];
    let spellIconId;
    if (buffCheck.length > 0) {
      spellIconId = buffCheck[0];
    } else {
      spellIconId = SPELLS.SHIELD_BLOCK_BUFF.id;
    }

    const physicalTable = (this.physicalChecks.length > 0) ? (
      <>
          <thead>
            <tr>
              <th>Physical</th>
              <th>Ability</th>
              <th>Passed</th>
              <th>Failed</th>
            </tr>
          </thead>
          <tbody>
            {
                this.physicalChecks.map(spell => (
                <tr key={spell}>
                  <td />
                  <th scope="row"><SpellLink id={spell} style={{ height: '2.5em' }} /></th>
                  <td>{formatNumber(this.checksPassedMap.get(spell))}</td>
                  <td>{formatNumber(this.checksFailedMap.get(spell))}</td>
                </tr>
              ))
            }
          </tbody>
      </>
    ) : null;

    const borderless = { borderTop: 'none' };
    const magicalTable = (this.magicalChecks.length > 0) ? (
      <>
          <thead>
            <tr>
              <th style={borderless}>Magical</th>
              <th style={borderless}>Ability</th>
              <th style={borderless}>Passed</th>
              <th style={borderless}>Failed</th>
            </tr>
          </thead>
          <tbody>
            {
              this.magicalChecks.map(spell => (
                <tr key={spell}>
                  <td />
                  <th scope="row"><SpellLink id={spell} style={{ height: '2.5em' }} /></th>
                  <td>{formatNumber(this.checksPassedMap.get(spell))}</td>
                  <td>{formatNumber(this.checksFailedMap.get(spell))}</td>
                </tr>
              ))
            }
          </tbody>
      </>
    ) : null;

    return (
      <StatisticBox
        icon={<SpellIcon id={spellIconId} />}
        value={`${formatPercentage(passSum / (passSum + failSum))} %`}
        label={`Soft mitigation checks passed.`}
        tooltip={this.tooltip}
      >
        <table className="table table-condensed" style={{ fontWeight: 'bold' }}>
          {physicalTable}
          {magicalTable}
        </table>
      </StatisticBox>
    );
  }
}

export default MitigationCheck;
