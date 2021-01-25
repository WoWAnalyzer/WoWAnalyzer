import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { RESONANT_WORDS_RANKS } from '@wowanalyzer/priest-holy/src/constants';

// Example Log: /report/da4AL7QPr36btCmV/8-Heroic+Huntsman+Altimor+-+Kill+(5:13)/Daemonlight/standard/statistics
class ResonantWords extends Analyzer {
  totalResonantWords = 0;
  usedResonantWords = 0;
  bonusHealing = 0;
  healingMultiplier = RESONANT_WORDS_RANKS[0];
  conduitRank: number = 0;
  conduitIncrease: number = 0;

  get wastedResonantWords() {
    return this.totalResonantWords - this.usedResonantWords;
  }

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.RESONANT_WORDS.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.healingMultiplier = RESONANT_WORDS_RANKS[this.conduitRank];

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL), this.onHeal);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_CHASTISE), this.onHolyWordCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_SANCTIFY), this.onHolyWordCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_SERENITY), this.onHolyWordCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_SALVATION_TALENT), this.onHolyWordCast);
  }

  onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RESONANT_WORDS_BUFF.id)) {
      this.usedResonantWords += 1;
      const eventBonusAmount = event.amount / (1 + (this.healingMultiplier / 100));
      this.bonusHealing += eventBonusAmount;
    }
  }

  onHolyWordCast() {
    this.totalResonantWords += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={`${this.wastedResonantWords}/${this.totalResonantWords} wasted resonant word buffs.`}
      >
        <ConduitSpellText spell={SPELLS.RESONANT_WORDS} rank={this.conduitRank}>
          <ItemHealingDone amount={this.bonusHealing} />
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default ResonantWords;
