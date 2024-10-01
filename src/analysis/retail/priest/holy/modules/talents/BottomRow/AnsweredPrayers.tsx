import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';
import { AP_HEALS_PER_TRIGGER_BY_RANK } from '../../../constants';

//Example log: /report/cCKp6qfAM8FZgxHL/2-Heroic+Broodkeeper+Diurna+-+Wipe+2+(1:34)/Mayceia/standard/statistics
class AnsweredPrayers extends Analyzer {
  prayerHeals = 0;
  healsPerApotheosis = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANSWERED_PRAYERS_TALENT);
    this.healsPerApotheosis =
      AP_HEALS_PER_TRIGGER_BY_RANK[
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
        <BoringSpellValueText spell={TALENTS.ANSWERED_PRAYERS_TALENT}>
          {this.prayerHeals}
          <small>
            {' '}
            <SpellLink spell={TALENTS.PRAYER_OF_MENDING_TALENT} /> heals
          </small>
          <br />
          {Math.floor(this.prayerHeals / this.healsPerApotheosis) * 8}
          <small>
            {' '}
            seconds of <SpellLink spell={TALENTS.APOTHEOSIS_TALENT} />
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default AnsweredPrayers;
