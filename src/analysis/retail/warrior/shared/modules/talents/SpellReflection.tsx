import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/warrior';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import BoringValueText from 'parser/ui/BoringValueText';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

class SpellReflection extends Analyzer {
  private totalCasts = 0;
  private totalDamage = 0;

  //only show do this analyzer when you have the spell reflection talent.
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPELL_REFLECTION_TALENT);
    if (!this.active) {
      return;
    }
    //subscribing to events
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    this.addEventListener(
      Events.cast.spell(SPELLS.SPELL_REFLECTION).by(SELECTED_PLAYER),
      this.recordCast,
    );
  }

  private recordDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SPELL_REFLECTION.id)) {
      //check ability type
      if (event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL) {
        this.totalDamage += event.amount;
      }
    }
  }

  private recordCast(event: CastEvent) {
    this.totalCasts += 1;
  }

  get averageMitigationPerCast() {
    if (this.totalCasts === 0) {
      return 0;
    }
    //since spell reflection
    return (this.totalDamage * 0.25) / this.totalCasts;
  }

  get totalMitigation() {
    return this.totalDamage * 0.25;
  }

  //show results on the statistics page
  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(3)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the sum of the damage mitigated by Spell Reflection. Total uses:{' '}
            {this.totalCasts}. This is purely based on the 20% magic damage reduction and does not
            include fully reflected spells.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={TALENTS.SPELL_REFLECTION_TALENT} /> Damage mitigated
            </>
          }
        >
          <>
            {formatNumber(this.totalMitigation)} <small>total</small>
            <br />
            {formatNumber(this.averageMitigationPerCast)} <small>average</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default SpellReflection;
