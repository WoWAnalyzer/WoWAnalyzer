import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import StatisticBox from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

import Garothi from 'Raids/AntorusTheBurningThrone/GarothiWorldbreaker';
import Felhounds from 'Raids/AntorusTheBurningThrone/FelhoundsOfSargeras';
import Council from 'Raids/AntorusTheBurningThrone/AntoranHighCommand';
import Eonar from 'Raids/AntorusTheBurningThrone/EonarLifebinder';
import PKeeper from 'Raids/AntorusTheBurningThrone/PortalKeeperHasabel';
import Imonar from 'Raids/AntorusTheBurningThrone/ImonarTheSoulhunter';
import KG from 'Raids/AntorusTheBurningThrone/Kingaroth';
import Vari from 'Raids/AntorusTheBurningThrone/Varimathras';
import Coven from 'Raids/AntorusTheBurningThrone/TheCovenOfShivarra';
import Agg from 'Raids/AntorusTheBurningThrone/Aggramar';
import Argus from 'Raids/AntorusTheBurningThrone/ArgusTheUnmaker';

const mitigationBuffs = {'Paladin' : [SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id,
                                      SPELLS.ARDENT_DEFENDER.id,
                                      SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id]};

const mitigationChecks = new Map([
  [Garothi.id, Object.values(Garothi.fight.softMitigationChecks)],
  [Felhounds.id, Object.values(Felhounds.fight.softMitigationChecks)],
  [Council.id, Object.values(Council.fight.softMitigationChecks)],
  [Eonar.id, Object.values(Eonar.fight.softMitigationChecks)],
  [PKeeper.id, Object.values(PKeeper.fight.softMitigationChecks)],
  [Imonar.id, Object.values(Imonar.fight.softMitigationChecks)],
  [KG.id, Object.values(KG.fight.softMitigationChecks)],
  [Vari.id, Object.values(Vari.fight.softMitigationChecks)],
  [Coven.id, Object.values(Coven.fight.softMitigationChecks)],
  [Agg.id, Object.values(Agg.fight.softMitigationChecks)],
  [Argus.id, Object.values(Argus.fight.softMitigationChecks)],
]);


class MitigationCheck extends Analyzer{
  static checks;
  static buffCheck;
  static checksPassed = 0;
  static checksFailed = 0;

  static dependencies = {
    combatants: Combatants,
  };

  on_initialized(){

  }

  on_toPlayer_damage(event){
    if(typeof this.checks === "undefined" || typeof this.buffCheck === "undefined"){
      const boss = this.owner.boss;
      this.checks = mitigationChecks.get(boss.id);
      if(typeof this.checks === "undefined"){
        this.checks = [];
      }
      this.buffCheck = mitigationBuffs[this.owner.player.type];
      this.checksPassed = 0;
      this.checksFailed = 0;
    }
    if(this.checks.includes(event.ability.guid)){
      if(this.buffCheck.some((e) => this.combatants.selected.hasBuff(e))){
        this.checksPassed += 1;
      } else {
        this.checksFailed += 1;
      }
    }
  }

  statistic(){
    if(this.checksPassed + this.checksFailed === 0){
      return null;
    }
    return (
      <StatisticBox icon={<SpellIcon id={this.buffCheck[0]} />}
        value={`${formatPercentage(this.checksPassed/(this.checksPassed+this.checksFailed))} %`}
        label={`Soft mitigation checks passed.`}
        tooltip={`% of tank-targeted abilities that were mitigated.`} />
    );
  }

}

export default MitigationCheck;
