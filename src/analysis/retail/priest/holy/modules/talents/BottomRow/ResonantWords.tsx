import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';

// Example Log: /report/kVQd4LrBb9RW2h6K/9-Heroic+The+Primal+Council+-+Wipe+5+(5:04)/Delipriest/standard/statistics
class ResonantWords extends Analyzer {
  totalResonantWords = 0;
  usedResonantWords = 0;
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  healingMultiplierRanks: number[] = [0, 0.25, 0.5];
  healingMultiplier = 2;
  talentRank = 0;

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
    this.healingMultiplier = this.healingMultiplierRanks[this.talentRank];

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL), this.onHeal);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_WORD_CHASTISE_TALENT),
      this.onHolyWordCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_WORD_SANCTIFY_TALENT),
      this.onHolyWordCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_WORD_SERENITY_TALENT),
      this.onHolyWordCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_WORD_SALVATION_TALENT),
      this.onHolyWordCast,
    );
  }

  onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RESONANT_WORDS_TALENT_BUFF.id)) {
      this.usedResonantWords += 1;

      this.healingDoneFromTalent += calculateEffectiveHealing(event, this.healingMultiplier);
      this.overhealingDoneFromTalent += calculateOverhealing(event, this.healingMultiplier);
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
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${this.wastedResonantWords}/${this.totalResonantWords} wasted resonant word buffs.`}
      >
        <TalentSpellText
          spellId={TALENTS.RESONANT_WORDS_TALENT.id}
          maxRanks={TALENTS.RESONANT_WORDS_TALENT.maxRanks}
        >
          <ItemHealingDone amount={this.healingDoneFromTalent} />
          <br />
          {formatPercentage(
            this.overhealingDoneFromTalent /
              (this.healingDoneFromTalent + this.overhealingDoneFromTalent),
          )}
          % OH
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default ResonantWords;
