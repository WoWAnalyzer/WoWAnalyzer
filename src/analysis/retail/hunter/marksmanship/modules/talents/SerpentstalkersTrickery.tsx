import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HasTarget, RemoveDebuffEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Aimed Shot also fires a Serpent Sting at the primary target.
 */

class SerpentstalkersTrickery extends Analyzer {
  damage = 0;
  aimedShotTargets: string[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SERPENTSTALKERS_TRICKERY_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_MM),
      this.onSerpentStingDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.AIMED_SHOT_TALENT),
      this.onAimedShotCast,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_MM),
      this.onStingRemoval,
    );
  }

  onSerpentStingDamage(event: DamageEvent) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this.aimedShotTargets.includes(target)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  onAimedShotCast(event: CastEvent) {
    if (!HasTarget(event)) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    this.aimedShotTargets.push(target);
  }

  onStingRemoval(event: RemoveDebuffEvent) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    const index = this.aimedShotTargets.indexOf(target);
    if (index !== -1) {
      this.aimedShotTargets.splice(index, 1);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.SERPENTSTALKERS_TRICKERY_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SerpentstalkersTrickery;
