import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from 'Main/StatisticBox';
import SixStackBites from 'Parser/Hunter/Survival/Modules/Features/MongooseFury/SixStackBites';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import ItemDamageDone from 'Main/ItemDamageDone';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

class FuryOfTheEagle extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    sixStackBites: SixStackBites,
  };

  bonusDamage = 0;
  damageHits = 0;
  casts = 0;
  mongooseStacks = 0;
  uniqueTargets = [];
  targetsHit = 0;

  get averageTargetsHit() {
    return (this.targetsHit / this.casts).toFixed(2);
  }

  get averageHitsPerCast() {
    return (this.damageHits / this.casts).toFixed(2);
  }

  get uptimeInSeconds() {
    return this.combatants.selected.getBuffUptime(SPELLS.FURY_OF_THE_EAGLE_TRAIT.id) / 1000;
  }

  get averageChannelingTime() {
    return this.uptimeInSeconds / this.casts;
  }

  get averageMongooseStacksOnCast() {
    return (this.mongooseStacks / this.casts).toFixed(1);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FURY_OF_THE_EAGLE_TRAIT.id) {
      return;
    }
    this.casts++;
    this.uniqueTargets = [];
    this.mongooseStacks += this.sixStackBites.currentMFStacks;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FURY_OF_THE_EAGLE_DAMAGE.id) {
      return;
    }
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.uniqueTargets.includes(damageTarget)) {
      this.targetsHit++;
      this.uniqueTargets.push(damageTarget);
    }
    this.damageHits++;
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  get averageMFStacksThreshold() {
    return {
      actual: this.averageMongooseStacksOnCast,
      isLessThan: {
        minor: 6,
        average: 5,
        major: 4,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.averageMFStacksThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You cast <SpellLink id={SPELLS.FURY_OF_THE_EAGLE_TRAIT.id} /> when you had a low amount of <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> stacks. Aim to cast it while you have 6 stacks of <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> to maximize the damage of it, whilst fishing for additional resets of <SpellLink id={SPELLS.MONGOOSE_BITE.id} />. </Wrapper>)
        .icon(SPELLS.FURY_OF_THE_EAGLE_TRAIT.icon)
        .actual(`${this.averageMongooseStacksOnCast} average stacks of mongoose Fury on cast`)
        .recommended(`${recommended} stacks is recommended`);
    });
  }

  statistic() {
    if (this.bonusDamage > 0) {
      return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.FURY_OF_THE_EAGLE_TRAIT.id} />}
          value={this.averageTargetsHit}
          label="Average targets hit"
          tooltip={`You had an average of ${this.averageMongooseStacksOnCast} Mongoose Fury stacks when casting Fury of the Eagle. <br/> You had an average of ${this.averageHitsPerCast} hits per cast of Fury of the Eagle. This means you hit each unique target approximately ${(this.averageHitsPerCast / this.averageTargetsHit).toFixed(2)} times per cast. <br/> Your average channeling time was ${this.averageChannelingTime.toFixed(2)} seconds.`}
        />
      );
    }
  }

  subStatistic() {
    if (this.bonusDamage > 0) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.FURY_OF_THE_EAGLE_TRAIT.id} />
          </div>
          <div className="flex-sub text-right">
            <ItemDamageDone amount={this.bonusDamage} />
          </div>
        </div>
      );
    }
  }
}

export default FuryOfTheEagle;
