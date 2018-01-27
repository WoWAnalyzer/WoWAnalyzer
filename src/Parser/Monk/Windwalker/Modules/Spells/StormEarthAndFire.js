import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';


class StormEarthAndFire extends Analyzer{
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  risingSunKicks = 0;
  fistsOfFuries = 0;
  strikeOfTheWindlords = 0;
  whirlingDragonPunches = 0;  

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

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (!this.combatants.selected.hasBuff(SPELLS.STORM_EARTH_AND_FIRE_CAST.id) && !this.combatants.selected.hasBuff(SPELLS.SERENITY_TALENT.id)) {
      return;
    }
    switch (spellId) {
      case SPELLS.RISING_SUN_KICK.id:
        this.risingSunKicks += 1;
        break;
      case SPELLS.FISTS_OF_FURY_CAST.id:
        this.fistsOfFuries += 1;
        break;
      case SPELLS.STRIKE_OF_THE_WINDLORD.id:
        this.strikeOfTheWindlords += 1;
        break;
      case SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id:
        this.whirlingDragonPunches += 1;
        break;
      default:
        break;
    }
  }


  statistic() {
   const icon = this.combatants.selected.hasTalent(SPELLS.SERENITY_TALENT.id) ? SPELLS.SERENITY_TALENT : SPELLS.STORM_EARTH_AND_FIRE_CAST;
   const drinkingHornCover = this.combatants.selected.hasWrists(ITEMS.DRINKING_HORN_COVER.id) ? 1 : 0;
   const castCount = this.abilityTracker.getAbility(icon.id).casts;
   return (
     <StatisticBox
       icon={<SpellIcon id={icon.id} />}
       label={
          <div>
           During your {castCount} {icon.name}s you cast:
          <li>{this.risingSunKicks}/{castCount * (2 + drinkingHornCover) + 1} Rising Sun Kicks</li>
          <li>{this.fistsOfFuries}/{castCount + drinkingHornCover} Fists of Furies</li>
          <li>{this.strikeOfTheWindlords}/{castCount} Strikes of the Windlord</li>
              {this.whirlingDragonPunches > 0
              ? <li>{this.whirlingDragonPunches}/{castCount} Whirling Dragon Punches</li> : ''
              }
        </div>
       }
     />
   );
  }
statisticOrder = STATISTIC_ORDER.CORE(14);


}

export default StormEarthAndFire;
