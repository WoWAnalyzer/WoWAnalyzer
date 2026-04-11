import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import SPECS from 'game/SPECS';
import { isFromAfterimageDamage } from '../../../normalizers/AfterimageDamageCastLinkNormalizer';
import { CHRONAL_DYNAMO_MULTIPLIER } from 'analysis/retail/evoker/shared';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

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
    if (this.owner.selectedCombatant.specId === SPECS.AUGMENTATION_EVOKER.id) {
      // As Echo and Lifespark do not exist for Aug, and it has no healing empowers,
      // no checks are needed for healing events.
      // Rather than check the player's spec on each event, we can just call a different
      // handler for heal events depending on spec.
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_HEAL),
        this.onHealAug,
      );
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_DAMAGE),
      this.onDamage,
    );
  }

  onHealAug(event: HealEvent) {
    this.chronalDynamoHealing += calculateEffectiveHealing(event, CHRONAL_DYNAMO_MULTIPLIER);
  }

  onDamage(event: DamageEvent) {
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
          <div>
            <ItemDamageDone amount={this.chronalDynamoDamage} />
          </div>
          <div>
            <ItemHealingDone amount={this.chronalDynamoHealing} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ChronalDynamo;
