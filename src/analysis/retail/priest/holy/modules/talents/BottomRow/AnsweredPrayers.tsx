import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';
import { ANSWERED_PRAYERS_TRIGGER } from 'analysis/retail/priest/holy/constants';

class AnsweredPrayers extends Analyzer {
  prayerHeals = 0;
  healsPerApotheosis = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANSWERED_PRAYERS_TALENT);
    this.healsPerApotheosis =
      ANSWERED_PRAYERS_TRIGGER[
        this.selectedCombatant.getTalentRank(TALENTS.ANSWERED_PRAYERS_TALENT)
      ];
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PRAYER_OF_MENDING_HEAL),
      this.onByPOMHeal,
    );
  }
  onByPOMHeal(event: HealEvent) {
    this.prayerHeals += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>Healing in each Apotheosis can be seen in the 'Cooldowns' tab</>}
      >
        <BoringSpellValueText spellId={TALENTS.ANSWERED_PRAYERS_TALENT.id}>
          {this.prayerHeals} <SpellLink id={SPELLS.PRAYER_OF_MENDING_CAST.id} /> heals
          <br />
          {Math.floor(this.prayerHeals / this.healsPerApotheosis) * 8} seconds of{' '}
          <SpellLink id={SPELLS.APOTHEOSIS_TALENT.id} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default AnsweredPrayers;
