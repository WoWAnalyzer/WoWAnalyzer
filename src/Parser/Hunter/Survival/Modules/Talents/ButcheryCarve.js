import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';
import StatisticBox from 'Main/StatisticBox';
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS/HUNTER';
import Hellcarver from 'Parser/Hunter/Survival/Modules/Traits/Hellcarver';
import { formatNumber, formatPercentage } from 'common/format';

/**
 * Carve: A sweeping attack that strikes all enemies in front of you for 324% Physical damage.
 * Butchery: Strike all nearby enemies in a flurry of strikes, inflicting 694% Physical damage to each.
 */
class ButcheryCarve extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    hellcarver: Hellcarver,
  };

  bonusDamage = 0;
  damageHits = 0;
  casts = 0;
  totalStacksUsed = 0;

  get averageTargetsHit() {
    return (this.damageHits / this.casts).toFixed(2);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BUTCHERY_TALENT.id && spellId !== SPELLS.CARVE.id) {
      return;
    }
    this.casts++;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BUTCHERY_TALENT.id && spellId !== SPELLS.CARVE.id) {
      return;
    }
    this.damageHits++;
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  get averageTargetsThreshold() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 2,
        average: 1.75,
        major: 1.5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    const spellLink = this.combatants.selected.hasTalent(SPELLS.BUTCHERY_TALENT.id) ? SPELLS.BUTCHERY_TALENT : SPELLS.CARVE;
    when(this.averageTargetsThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Your <SpellLink id={spellLink.id} /> hit a low amount of targets on average throughout this encounter. Try and position yourself so that you'll hit as many targets as possible with <SpellLink id={spellLink.id} />. <strong>Note:</strong> that when using <ItemLink id={ITEMS.BUTCHERS_BONE_APRON.id} /> it can be worth using <SpellLink id={spellLink.id} /> on single-target when at 10 stacks, however it's generally recommended to use a different legendary if possible for largely single-target fights.</Wrapper>)
        .icon(spellLink.icon)
        .actual(`${this.averageTargetsHit} targets hit on average`)
        .recommended(`>${recommended} targets hit on average is recommended`);
    });
  }

  statistic() {
    if (this.bonusDamage > 0) {
      const spellLink = this.combatants.selected.hasTalent(SPELLS.BUTCHERY_TALENT.id) ? SPELLS.BUTCHERY_TALENT : SPELLS.CARVE;
      const tooltipText = this.hellcarver.hellcarverRanks > 0 ? `${this.hellcarver.hellcarverRanks} ranks of Hellcarver increased ${spellLink.name} damage by ${formatPercentage(this.hellcarver.hellcarverModifierPrTarget)}% per additional target hit. <br/> This contributed with ${formatNumber(this.hellcarver.damageContribution)} of the total damage that ${spellLink.name} dealt, this is the same as ${formatNumber(this.hellcarver.damageContribution / this.owner.fightDuration * 1000)} DPS or ${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.hellcarver.damageContribution))}% of your total damage` : ``;
      return (
        <StatisticBox
          icon={<SpellIcon id={spellLink.id} />}
          value={this.averageTargetsHit}
          label="Average targets hit"
          tooltip={tooltipText} />
      );
    }
  }

  subStatistic() {
    if (this.bonusDamage > 0) {
      const spellLink = this.combatants.selected.hasTalent(SPELLS.BUTCHERY_TALENT.id) ? SPELLS.BUTCHERY_TALENT : SPELLS.CARVE;
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={spellLink.id} />
          </div>
          <div className="flex-sub text-right">
            <ItemDamageDone amount={this.bonusDamage} />
          </div>
        </div>
      );
    }
  }
}

export default ButcheryCarve;
