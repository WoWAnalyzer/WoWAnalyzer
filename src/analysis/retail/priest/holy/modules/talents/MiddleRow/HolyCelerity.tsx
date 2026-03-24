import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Statistic from 'parser/ui/Statistic';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const HOLY_WORDS = [
  TALENTS_PRIEST.HOLY_WORD_SERENITY_TALENT,
  TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT,
  TALENTS_PRIEST.HOLY_WORD_CHASTISE_TALENT,
];
const COOLDOWN_REDUCTION_MS = 15000; // 15 seconds

/**
 * Holy Celerity
 * Reduces the cooldown of your Holy Words by 15 sec.
 */

class HolyCelerity extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.HOLY_CELERITY_TALENT);
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
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip="Total cooldown reduction from all Holy Word casts. Each cast effectively had 15 seconds less cooldown."
      >
        <TalentSpellText talent={TALENTS_PRIEST.HOLY_CELERITY_TALENT}>
          <ItemCooldownReduction effective={this.totalCdr} />
          {/* oxlint-disable-next-line @wowanalyzer/no-br */}
          <br />
          <small>total cooldown reduction</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HolyCelerity;