import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import {
  getChronoFlameDamageLink,
  isFromAfterimageDamage,
} from '../../../normalizers/ChronowardenCastLinkNormalizer';

/**
 * Empower spells fire a Chrono Flame at up to 3 targets struck.
 * Healing empowers are not yet implemented.
 */
class Afterimage extends Analyzer {
  afterimageDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CHRONAL_DYNAMO_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    if (!isFromAfterimageDamage(event)) {
      return;
    }
    this.afterimageDamage += event.amount;
    this.afterimageDamage += getChronoFlameDamageLink(event)?.amount ?? 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS.AFTERIMAGE_TALENT}>
          <div>
            <ItemDamageDone amount={this.afterimageDamage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Afterimage;
