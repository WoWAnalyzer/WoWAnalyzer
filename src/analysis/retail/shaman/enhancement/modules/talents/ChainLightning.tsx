import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import { SpellLink } from 'interface';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { EnhancementEventLinks } from '../../constants';

const CRASH_LIGHTNING_REDUCTION = 1000;

/**
 * Hurls a lightning bolt at the enemy, dealing (63.5% of Spell power) Nature damage and then jumping to additional nearby enemies. Affects 3 total targets.
 *
 *  Enhancement (Level 38)
 * If Chain Lightning hits more than 1 target, each target hit by your Chain Lightning increases the damage of your next Crash Lightning by 20%
 *
 *  Enhancement (Level 52)
 * Each target hit by Chain Lightning reduces the cooldown of Crash Lightning by 1.0 sec
 */
class ChainLightning extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected has4pcT30: boolean = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT);
    if (!this.active) {
      return;
    }
    this.has4pcT30 = this.selectedCombatant.has4PieceByTier(TIERS.DF2);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT),
      this.onCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    const hits =
      event._linkedEvents?.filter(
        (le) => le.relation === EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
      ).length || 0;
    if (hits < 2) {
      if (this.has4pcT30) {
        if (!this.selectedCombatant.getBuff(SPELLS.CRACKLING_THUNDER_TIER_BUFF.id)) {
          addInefficientCastReason(
            event,
            <>
              <SpellLink spell={TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT} /> only hit one target and
              was cast without <SpellLink spell={SPELLS.CRACKLING_THUNDER_TIER_BUFF} />
            </>,
          );
        }
      }
    } else {
      addInefficientCastReason(
        event,
        <>
          <SpellLink spell={TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT} /> only hit one target
        </>,
      );
    }
  }

  onDamage() {
    if (this.spellUsable.isOnCooldown(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id)) {
      this.spellUsable.reduceCooldown(
        TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id,
        CRASH_LIGHTNING_REDUCTION,
      );
    }
  }
}

export default ChainLightning;
