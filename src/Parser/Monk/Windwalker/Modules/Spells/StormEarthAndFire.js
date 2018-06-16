import React from 'react';
import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class StormEarthAndFire extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  risingSunKicks = 0;
  fistsOfFuries = 0;
  whirlingDragonPunches = 0;
  ability = SPELLS.STORM_EARTH_AND_FIRE_CAST;
  castCount = 0;
  drinkingHornCover = 0;

  //TODO: Implement Spiritual Focus cooldown reduction

  on_initialized() {
    this.ability = this.combatants.selected.hasTalent(SPELLS.SERENITY_TALENT.id) ? SPELLS.SERENITY_TALENT : SPELLS.STORM_EARTH_AND_FIRE_CAST;
    this.drinkingHornCover = this.combatants.selected.hasWrists(ITEMS.DRINKING_HORN_COVER.id) ? 1 : 0;
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
      case SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id:
        this.whirlingDragonPunches += 1;
        break;
      default:
        break;
    }
  }

  risingSunKickStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.RISING_SUN_KICK.id} />
        </div>
        <div className="flex-sub text-right">
          {this.risingSunKicks}/{this.castCount * (2 + this.drinkingHornCover) + 1}
        </div>
      </div>
    );
  }

  fistsofFuryStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} />
        </div>
        <div className="flex-sub text-right">
          {this.fistsOfFuries}/{this.castCount + this.drinkingHornCover}
        </div>
      </div>
    );
  }

  whirlingDragonPunchStatistic() {
    if (this.combatants.selected.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id)) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id} />
          </div>
          <div className="flex-sub text-right">
            {this.whirlingDragonPunches}/{this.castCount}
          </div>
        </div>
      );
    }
    return null;
  }

  statistic() {
    this.castCount = this.abilityTracker.getAbility(this.ability.id).casts;
    return (
      <StatisticsListBox
        title={
          <React.Fragment>
            <SpellIcon id={this.ability.id} noLink /> {this.ability.name}
          </React.Fragment>
        }
        tooltip={`This shows the possible amount of casts during ${this.ability.name}`}
        style={{ minHeight: 186 }}
      >
        {this.risingSunKickStatistic()}
        {this.fistsofFuryStatistic()}
        {this.whirlingDragonPunchStatistic()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(11);
}

export default StormEarthAndFire;
