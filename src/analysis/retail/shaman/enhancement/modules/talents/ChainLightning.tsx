import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { EnhancementEventLinks } from '../../constants';

const CRASH_LIGHTNING_REDUCTION = 500;

/**
 * Hurls a lightning bolt at the enemy, dealing (63.5% of Spell power) Nature damage and then jumping to additional nearby enemies. Affects 3 total targets.
 *
 *  Enhancement (Level 38)
 * If Chain Lightning hits more than 1 target, each target hit by your Chain Lightning increases the damage of your next Crash Lightning by 10%
 *
 *  Enhancement (Level 52)
 * Each target hit by Chain Lightning reduces the cooldown of Crash Lightning by 0.5 sec
 */
class ChainLightning extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.CHAIN_LIGHTNING_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_LIGHTNING_TALENT),
      this.onCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_LIGHTNING_TALENT),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    const hits =
      event._linkedEvents?.filter(
        (le) => le.relation === EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
      ).length || 0;

    if (hits < 2) {
      addInefficientCastReason(
        event,
        <>
          <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> only hit one target
        </>,
      );
    }
  }

  onDamage() {
    if (this.deps.spellUsable.isOnCooldown(TALENTS.CHAIN_LIGHTNING_TALENT.id)) {
      this.deps.spellUsable.reduceCooldown(
        TALENTS.CHAIN_LIGHTNING_TALENT.id,
        CRASH_LIGHTNING_REDUCTION,
      );
    }
  }
}

export default ChainLightning;
