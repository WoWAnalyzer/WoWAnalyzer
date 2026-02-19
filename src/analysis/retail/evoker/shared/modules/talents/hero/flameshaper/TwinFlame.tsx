import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { getCastEventFromDamage } from 'analysis/retail/evoker/devastation/modules/normalizers/CastLinkNormalizer';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

/**
 * Consuming Essence Burst fires a twin flame,
 * striking your target for (180% of Spell Power) Fire damage.
 */
class TwinFlame extends Analyzer {
  twinFlameDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TWIN_FLAME_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TWIN_FLAME),
      this.onDamage,
    );
  }

  protected onDamage(event: DamageEvent) {
    if (this.hitMainTarget(event)) {
      this.twinFlameDamage += event.amount + (event.absorbed || 0);
    }
  }

  protected hitMainTarget(event: DamageEvent) {
    const castEvent = getCastEventFromDamage(event);
    return !castEvent || encodeEventTargetString(castEvent) === encodeEventTargetString(event);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS.TWIN_FLAME_TALENT}>
          <ItemDamageDone amount={this.twinFlameDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TwinFlame;
