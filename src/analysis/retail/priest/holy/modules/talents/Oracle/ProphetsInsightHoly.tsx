import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const HOLY_WORDS = [
  TALENTS_PRIEST.HOLY_WORD_SERENITY_TALENT,
  TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT,
  TALENTS_PRIEST.HOLY_WORD_CHASTISE_TALENT,
];
const COOLDOWN_REDUCTION_MS = 5000; // 5 seconds

class ProphetsInsightHoly extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PROPHETS_INSIGHT_TALENT);
  }

  get totalCdr() {
    let totalCasts = 0;
    HOLY_WORDS.forEach((spell) => {
      totalCasts += this.abilityTracker.getAbility(spell.id).casts;
    });
    return totalCasts * COOLDOWN_REDUCTION_MS;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip="Total cooldown reduction from all Holy Word casts. Each cast effectively had 5 seconds less cooldown."
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.PROPHETS_INSIGHT_TALENT}>
          <ItemCooldownReduction effective={this.totalCdr} />
          {/* oxlint-disable-next-line @wowanalyzer/no-br */}
          <br />
          <small>total cooldown reduction</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ProphetsInsightHoly;