import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const COOLDOWN_REDUCTION = 500;

export default class WalkWithTheOx extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  rank?: number;
  effCdr = 0;
  wastedCdr = 0;

  private sckTarget?: number;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.conduitRankBySpellID(SPELLS.WALK_WITH_THE_OX.id);
    if(!this.rank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.cast.spell(SPELLS.BLACKOUT_KICK_BRM).by(SELECTED_PLAYER), this.reduceCooldown);
    this.addEventListener(Events.cast.spell(SPELLS.KEG_SMASH).by(SELECTED_PLAYER), this.reduceCooldown);
    // SCK generates 1 shuffle application per tick of the channel that hits at
    // least one enemy. this concoction is equal to that in 99% of cases. we
    // could try to determine whether two damage events are for the same tick,
    // but that is way more error-prone with haste shenanigans allowing some
    // VERY short SCKs
    this.addEventListener(Events.cast.spell(SPELLS.SPINNING_CRANE_KICK_BRM).by(SELECTED_PLAYER), this.startSCK);
    this.addEventListener(Events.damage.spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE).by(SELECTED_PLAYER), this.reduceCooldownSCK);
  }

  private reduceCooldown() {
    if(this.spellUsable.isOnCooldown(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id)) {
      const cdr = this.spellUsable.reduceCooldown(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id, COOLDOWN_REDUCTION);
      this.effCdr += cdr;
      this.wastedCdr += COOLDOWN_REDUCTION - cdr;
    }
  }

  private startSCK(_event: CastEvent) {
    this.sckTarget = undefined;
  }

  private reduceCooldownSCK(event: DamageEvent) {
    if(!this.sckTarget) {
      this.sckTarget = event.targetID;
    }

    if(this.sckTarget !== event.targetID) {
      return;
    }

    this.reduceCooldown();
  }
}
