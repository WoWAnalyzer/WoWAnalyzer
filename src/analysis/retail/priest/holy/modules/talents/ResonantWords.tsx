import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { RESONANT_WORDS_RANKS } from 'analysis/retail/priest/holy/constants';

// Example Log: /report/da4AL7QPr36btCmV/8-Heroic+Huntsman+Altimor+-+Kill+(5:13)/Daemonlight/standard/statistics
class ResonantWords extends Analyzer {
  totalResonantWords = 0;
  usedResonantWords = 0;
  bonusHealing = 0;
  healingMultiplier = RESONANT_WORDS_RANKS[0];
  talentRank: number = 0;
  talentIncrease: number = 0;

  get wastedResonantWords() {
    return this.totalResonantWords - this.usedResonantWords;
  }

  constructor(options: Options) {
    super(options);

    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS.RESONANT_WORDS_TALENT);
    if (!this.talentRank) {
      this.active = false;
      return;
    }
    this.healingMultiplier = RESONANT_WORDS_RANKS[this.talentRank];

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL), this.onHeal); //Not sure why pvp talent is included

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_CHASTISE_TALENT),
      this.onHolyWordCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_SANCTIFY),
      this.onHolyWordCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_SERENITY),
      this.onHolyWordCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_WORD_SALVATION_TALENT),
      this.onHolyWordCast,
    );
  }

  onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RESONANT_WORDS_BUFF.id)) {
      this.usedResonantWords += 1;
      const eventBonusAmount = event.amount - event.amount / (1 + this.healingMultiplier);
      this.bonusHealing += eventBonusAmount;
    }
  }

  onHolyWordCast() {
    this.totalResonantWords += 1;
  }

  statistic() {
    //Should have new talent ui that shows points rank={this.talentRank}>
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${this.wastedResonantWords}/${this.totalResonantWords} wasted resonant word buffs.`}
      >
        <BoringSpellValueText spellId={SPELLS.RESONANT_WORDS.id}>
          <ItemHealingDone amount={this.bonusHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ResonantWords;
