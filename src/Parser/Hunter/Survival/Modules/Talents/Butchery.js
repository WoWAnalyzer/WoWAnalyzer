import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';
import StatisticBox from 'Main/StatisticBox';
import ITEMS from 'common/ITEMS/HUNTER';
import Wrapper from 'common/Wrapper';

class Butchery extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  bonusDamage = 0;
  damageHits = 0;
  casts = 0;
  totalStacksUsed = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BUTCHERY_TALENT.id);
  }

  get averageTargetsHit() {
    return (this.damageHits / this.casts).toFixed(2);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BUTCHERY_TALENT.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.BUTCHERS_BONE_APRON_BUFF.id, event.timestamp)) {
      this.totalStacksUsed += this.combatants.selected.owner.modules.butchersBoneApron.apronStacks;
    }
    this.casts++;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BUTCHERY_TALENT.id) {
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
    when(this.averageTargetsThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Your <SpellLink id={SPELLS.BUTCHERY_TALENT.id} icon /> hit a low amount of targets on average throughout this encounter. Try and position yourself so that you'll hit as many targets as possible with <SpellLink id={SPELLS.BUTCHERY_TALENT.id} icon />.</Wrapper>)
        .icon(SPELLS.BUTCHERY_TALENT.icon)
        .actual(`${this.averageTargetsHit} targets hit on averages`)
        .recommended(`>${recommended} targets hit on average is recommended`);
    });
  }

  statistic() {
    const tooltipText = this.combatants.selected.hasChest(ITEMS.BUTCHERS_BONE_APRON.id) ? `You had an average of ${(this.totalStacksUsed / this.casts).toFixed(1)} stacks of the Butchers Bone Apron buff when casting Butchery` : ``;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BUTCHERY_TALENT.id} />}
        value={this.averageTargetsHit}
        label="Average targets hit"
        tooltip={tooltipText} />
    );
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.BUTCHERY_TALENT.id}>
            <SpellIcon id={SPELLS.BUTCHERY_TALENT.id} noLink /> Butchery
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDamage} />
        </div>
      </div>
    );
  }
}

export default Butchery;
