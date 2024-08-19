import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import SPELLS from 'common/SPELLS/classic/priest';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Sin and Punishment (talent) reduces the cooldown of Shadowfiend by 10sec each time Mind Flay crits.
 */
class Shadowfiend extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  reductionTime: number = 10000; // ms (10 seconds)

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY),
      this.onMindFlayDamage,
    );
  }

  onMindFlayDamage(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.shadowfiendReduction(SPELLS.SHADOW_FIEND.id);
    }
  }

  shadowfiendReduction(spellId: number): number {
    if (!this.spellUsable.isAvailable(spellId)) {
      return this.spellUsable.reduceCooldown(spellId, this.reductionTime);
    }
    return 0;
  }
}

export default Shadowfiend;
