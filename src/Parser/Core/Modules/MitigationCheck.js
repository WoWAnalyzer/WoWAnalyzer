import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import StatisticBox from 'Main/StatisticBox';
import Enemies from 'Parser/Core/Modules/Enemies';

import {findByBossId} from 'Raids/index';

const mitigationBuffs = {'Paladin' : [SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id,
                                      SPELLS.ARDENT_DEFENDER.id,
                                      SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id],
                          'Monk' : [],
                          'Warrior': [SPELLS.SHIELD_BLOCK_BUFF.id,
                                      SPELLS.IGNORE_PAIN.id,
                                      SPELLS.LAST_STAND.id,
                                      SPELLS.SHIELD_WALL.id,
                                      SPELLS.SPELL_REFLECTION.id],
                          'DemonHunter': [SPELLS.DEMON_SPIKES_BUFF.id,
                                          SPELLS.METAMORPHOSIS_TANK.id],
                          'Druid': [SPELLS.IRONFUR.id,
                                    SPELLS.FRENZIED_REGENERATION.id,
                                    SPELLS.BARKSKIN.id,
                                    SPELLS.SURVIVAL_INSTINCTS.id],
                          'DeathKnight': [SPELLS.BONE_SHIELD.id,
                                          SPELLS.BLOOD_SHIELD.id,
                                          SPELLS.ANTI_MAGIC_SHELL.id,
                                          SPELLS.VAMPIRIC_BLOOD.id,
                                          SPELLS.ICEBOUND_FORTITUDE.id,
                                          SPELLS.DANCING_RUNE_WEAPON_BUFF.id]};

const mitigationDebuffs = {'Paladin' : [],
                            'Monk' : [],
                            'Warrior': [SPELLS.DEMORALIZING_SHOUT.id],
                            'DemonHunter': [SPELLS.FIERY_BRAND_DEBUFF.id],
                            'Druid': [],
                            'DeathKnight': []};


class MitigationCheck extends Analyzer{

  static checks;
  static buffCheck;
  static debuffCheck;
  static checksPassed;
  static checksFailed;

  static dependencies = {
    enemies: Enemies,
  };


  constructor(...args) {
    super(...args);
    this.checksPassed = 0;
    this.checksFailed = 0;
    const boss = findByBossId(this.owner.boss.id);
    if(boss !== null && boss.fight.hasOwnProperty('softMitigationChecks')){
      this.checks = Object.values(boss.fight.softMitigationChecks);
      if(typeof this.checks === "undefined"){
        this.checks = [];
      }
      this.buffCheck = mitigationBuffs[this.owner.player.type];
      this.debuffCheck = mitigationDebuffs[this.owner.player.type];
    }else {
      this.checks = [];
      this.buffCheck = [];
      this.debuffCheck = [];
    }
  }


  on_toPlayer_damage(event){
    if(this.checks.includes(event.ability.guid) && !event.tick){
      if(this.buffCheck.some((e) => this.selectedCombatant.hasBuff(e))){
        this.checksPassed += 1;
      } else {
        const enemy = this.enemies.getEntities()[event.sourceID];
        //We want to get the source rather than the player's target, so no getEntity().
        if(enemy && this.debuffCheck.some((e) => enemy.hasBuff(e, event.timestamp))){
          this.checksPassed += 1;
        } else {
          this.checksFailed += 1;
        }
      }
    }
  }


  statistic(){
    if(this.checksPassed + this.checksFailed === 0){
      return null;
    }
    let spellIconId;
    if(this.buffCheck.length > 0){
      spellIconId = this.buffCheck[0];
    } else {
      spellIconId = SPELLS.SHIELD_BLOCK_BUFF.id;
    }
    return (
      <StatisticBox icon={<SpellIcon id={spellIconId} />}
        value={`${formatPercentage(this.checksPassed/(this.checksPassed+this.checksFailed))} %`}
        label={`Soft mitigation checks passed.`}
        tooltip={`${this.checksPassed}/${this.checksPassed+this.checksFailed} of tank-targeted abilities were mitigated.`} />
    );
  }

}


export default MitigationCheck;
