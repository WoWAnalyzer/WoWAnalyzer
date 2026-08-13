import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
// Add HealEvent import when updating for Pres
import Events, { DamageEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import SPECS from 'game/SPECS';
import { isFromAfterimageDamage } from '../../../normalizers/ChronowardenCastLinkNormalizer';
import { CHRONAL_DYNAMO_MULTIPLIER } from 'analysis/retail/evoker/shared';
// Add CalculateEffectiveHealing import when updating for Pres
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

/**
 * The cast time of Chrono Flames is reduced by 10%.
 * Living Flame deals 50% more damage and healing, unless that instance of damage/healing
 * was triggered by Echo [NYI] or Afterimage, or benefitted from Lifespark [NYI].
 */
class ChronalDynamo extends Analyzer {
  chronalDynamoHealing = 0;
  chronalDynamoDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CHRONAL_DYNAMO_TALENT);
    // Healing handler removed for Aug as not useful info
    // Needs a separate damage handler for Preservation with Lifespark [NYI]
    if (!this.selectedCombatant.hasTalent(TALENTS.LIFESPARK_TALENT)) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_DAMAGE),
        this.onDamageNoLifespark,
      );
    }
  }

  onDamageNoLifespark(event: DamageEvent) {
    if (isFromAfterimageDamage(event)) {
      return;
    }
    this.chronalDynamoDamage += calculateEffectiveDamage(event, CHRONAL_DYNAMO_MULTIPLIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS.CHRONAL_DYNAMO_TALENT}>
          {this.owner.selectedCombatant.specId === SPECS.PRESERVATION_EVOKER.id && (
            <div>
              <ItemHealingDone amount={this.chronalDynamoHealing} />
            </div>
          )}
          <div>
            <ItemDamageDone amount={this.chronalDynamoDamage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ChronalDynamo;
