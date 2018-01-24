import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

class StormEarthAndFire extends Analyzer{
  static dependencies = {
    combatants: Combatants,
  };

  risingSunKicks = 0;
  fistsOfFuries = 0;
  strikeOfTheWindlords = 0;
  whirlingDragonPunches = 0;
  sefCount = 0;

  get traitsCDReduction() {
    let traitsCDReduction = 0;
    const player = this.combatants.selected;
    const splitPersonalityRank = player.traitsBySpellId[SPELLS.SPLIT_PERSONALITY.id];
    //Calculates the reduction in cooldown/recharge on Serenity/Storm, Earth and Fire, based on the rank of the Personality Trait
    if (splitPersonalityRank < 5) {
      traitsCDReduction = splitPersonalityRank * 5;
    }
    else {
      switch (splitPersonalityRank) {
        case 5:
          traitsCDReduction = 24;
          break;
        case 6:
          traitsCDReduction = 28;
          break;
        case 7:
          traitsCDReduction = 31;
          break;
        default:
          break;
      }
    } return traitsCDReduction;
  }

  get reducedCooldownWithTraits() {
    const reducedCooldownWithTraits = 90 - this.traitsCDReduction;
    return reducedCooldownWithTraits;
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.STORM_EARTH_AND_FIRE_CAST.id === spellId || SPELLS.SERENITY_TALENT.id === spellId) {
      this.sefCount += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (!this.combatants.selected.hasBuff(SPELLS.STORM_EARTH_AND_FIRE_CAST.id) && !this.combatants.selected.hasBuff(SPELLS.SERENITY_TALENT.id)) {
      return;
    }
    if (SPELLS.RISING_SUN_KICK.id === spellId) {
      this.risingSunKicks += 1;
    }
    if (SPELLS.FISTS_OF_FURY_CAST.id === spellId) {
      this.fistsOfFuries += 1;
    }
    if (SPELLS.STRIKE_OF_THE_WINDLORD.id === spellId) {
      this.strikeOfTheWindlords += 1;
    }
    if (SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id === spellId) {
      this.whirlingDragonPunches += 1;
    }
  }


  statistic() {
   const icon = this.combatants.selected.hasTalent(SPELLS.SERENITY_TALENT.id) ? SPELLS.SERENITY_TALENT : SPELLS.STORM_EARTH_AND_FIRE_CAST;
   return (
     <StatisticBox
       icon={<SpellIcon id={icon.id} />}
       label={
          <div>
          During your {this.sefCount} {icon.name}s you cast: 
          <li>{this.risingSunKicks}/{this.sefCount*2+1} Rising Sun Kicks</li> 
          <li>{this.fistsOfFuries}/{this.sefCount} Fists of Furies</li>
          <li>{this.strikeOfTheWindlords}/{this.sefCount} Strikes of the Windlord</li>
              {this.whirlingDragonPunches > 0
              ? <li>{this.whirlingDragonPunches}/{this.sefCount} Whirling Dragon Punches</li> : ''
              }
        </div>
       }
     />
   );
  }
statisticOrder = STATISTIC_ORDER.CORE(14);


}

export default StormEarthAndFire;
