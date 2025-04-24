import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { VersatilityIcon } from 'interface/icons';
import { SpellLink } from 'interface';
import { hasEruptionCastLink } from '../normalizers/CastLinkNormalizer';

/**
 * Triggers an Eruption at the first 3 enemies hit by Breath of Eons / Deep Breath. These Eruptions are guaranteed to spawn a Mote of Possibility.
 */
class Overlord extends Analyzer {
  overlordDamage = 0;
  motesSpawned = 0;
  motesSinceLastCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.OVERLORD_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.applydebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DEEP_BREATH_DAM, SPELLS.TEMPORAL_WOUND_DEBUFF]),
      this.onApplyDebuff,
    );
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.DEEP_BREATH,
          TALENTS.BREATH_OF_EONS_TALENT,
          SPELLS.BREATH_OF_EONS_SCALECOMMANDER,
        ]),
      this.onCast,
    );
  }

  onDamage(event: DamageEvent) {
    if (
      this.selectedCombatant.hasBuff(SPELLS.DEEP_BREATH) ||
      this.selectedCombatant.hasBuff(TALENTS.BREATH_OF_EONS_TALENT) ||
      this.selectedCombatant.hasBuff(SPELLS.BREATH_OF_EONS_SCALECOMMANDER)
    ) {
      this.overlordDamage += event.amount;
    } else if (
      (this.selectedCombatant.hasBuff(SPELLS.DEEP_BREATH, null, 500) ||
        this.selectedCombatant.hasBuff(TALENTS.BREATH_OF_EONS_TALENT, null, 500) ||
        this.selectedCombatant.hasBuff(SPELLS.BREATH_OF_EONS_SCALECOMMANDER, null, 500)) &&
      !hasEruptionCastLink(event)
    ) {
      //With precise timing, it is possible to have an Overlord Eruption deal damage after Eons is cancelled.
      //This is fairly unlikely to happen unless there's something to gain from doing so (i.e. a bug).
      //But it's checked for anyway.
      this.overlordDamage += event.amount;
    }
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    if (this.motesSinceLastCast < 3) {
      this.motesSpawned += 1;
      this.motesSinceLastCast += 1;
    }
  }

  onCast(event: CastEvent) {
    this.motesSinceLastCast = 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS.OVERLORD_TALENT}>
          <ItemDamageDone amount={this.overlordDamage} />
          <br />
          <VersatilityIcon /> {this.motesSpawned}
          <small>
            {' '}
            <SpellLink spell={TALENTS.MOTES_OF_POSSIBILITY_TALENT} /> generated
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Overlord;
