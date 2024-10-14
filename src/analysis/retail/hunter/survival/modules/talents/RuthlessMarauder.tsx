import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/hunter';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/hunter';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import {
  RUTHLESS_MARAUDER_CDR,
  RUTHLESS_MARAUDER_CDR_COOLDOWN_MS,
} from 'analysis/retail/hunter/survival/constants';
import HIT_TYPES from 'game/HIT_TYPES';

/**
 * https://www.wowhead.com/spell=385718/ruthless-marauder
 *
 * Fury of the Eagle now gains bonus critical strike chance against targets below 50% health,
 * and Fury of the Eagle critical strikes reduce the cooldown of Wildfire Bomb and Flanking Strike by X sec.
 *
 * Warcraft log:
 * https://www.warcraftlogs.com/reports/ByAFTgt94fYJ8vjQ#fight=7&type=damage-done&source=7&translate=true
 */
class RuthlessMarauder extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private readonly cdr: number = 0;
  private lastCdrTimestamp: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.RUTHLESS_MARAUDER_TALENT);
    if (!this.active) {
      return;
    }

    this.cdr =
      RUTHLESS_MARAUDER_CDR[this.selectedCombatant.getTalentRank(TALENTS.RUTHLESS_MARAUDER_TALENT)];

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FURY_OF_THE_EAGLE_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    // Only critical hits shound count and there is a cooldown on how often this can proc.
    if (
      event.hitType !== HIT_TYPES.CRIT ||
      event.timestamp - this.lastCdrTimestamp < RUTHLESS_MARAUDER_CDR_COOLDOWN_MS
    ) {
      return;
    }

    this.lastCdrTimestamp = event.timestamp;

    if (this.spellUsable.isOnCooldown(TALENTS.FLANKING_STRIKE_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.FLANKING_STRIKE_TALENT.id, this.cdr);
    }

    if (this.spellUsable.isOnCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id, this.cdr);
    }
  }
}

export default RuthlessMarauder;
