import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * When you gain Insurance!, your next 2 Blackout Kicks deal 150% increased damage and have
 * a 2 second reduced cooldown.
 *
 * ## Implementation
 * There is a separate buff for this (Opportunistic Strikes), so it is easy to track. We just reduce the cooldown after the cast if the buff is present.
 * The buff falls off shortly after the cast (or at least did on ptr).
 */
export default class WarWithinS2TierSet extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.TWW2);

    this.addEventListener(
      Events.cast.spell(SPELLS.BLACKOUT_KICK_BRM).by(SELECTED_PLAYER),
      this.reduceCooldown,
    );
  }

  private reduceCooldown(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.OPPORTUNISTIC_STRIKE_BUFF)) {
      this.deps.spellUsable.reduceCooldown(SPELLS.BLACKOUT_KICK_BRM.id, OPPORTUNISTIC_STRIKE_CDR);
    }
  }
}

const OPPORTUNISTIC_STRIKE_CDR = 2000;
