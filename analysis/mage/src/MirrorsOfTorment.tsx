import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  RemoveDebuffEvent,
  RemoveDebuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import { MS_BUFFER_100 } from '@wowanalyzer/mage';

const FIRE_BLAST_REDUCTION_MS = 6000;
const MIRRORS_OF_TORMENT_REDUCTION_MS = 4000;

class MirrorsOfTorment extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    eventHistory: EventHistory,
  };
  protected spellUsable!: SpellUsable;
  protected eventHistory!: EventHistory;

  hasSinfulDelight: boolean;

  //Currently only added to Fire Mage CombatLogParser, but leaving module in Shared in case i add to it for other specs
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);
    this.hasSinfulDelight = this.selectedCombatant.hasLegendary(SPELLS.SINFUL_DELIGHT);
    this.addEventListener(
      Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.MIRRORS_OF_TORMENT),
      this.onDebuffRemoved,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.MIRRORS_OF_TORMENT),
      this.onDebuffRemoved,
    );
    if (this.hasSinfulDelight) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BLAST),
        this.mirrorCDR,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BRAIN_FREEZE),
        this.mirrorCDR,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CLEARCASTING_ARCANE),
        this.mirrorCDR,
      );
    }
  }

  mirrorCDR(event: CastEvent | RemoveBuffEvent) {
    const spellId = event.ability.guid;

    //If Brain Freeze was removed in any way other than Flurry being cast, disregard
    const lastFlurry = this.eventHistory.last(
      1,
      MS_BUFFER_100,
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLURRY),
    );
    if (spellId === SPELLS.BRAIN_FREEZE.id && lastFlurry.length === 0) {
      return;
    }

    //If Clearcasting was removed in any way other than Arcane Missiles or Arcane Explosion being cast, disregard
    const lastClearcastingSpender = this.eventHistory.last(
      1,
      MS_BUFFER_100,
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_MISSILES, SPELLS.ARCANE_EXPLOSION]),
    );
    if (spellId === SPELLS.CLEARCASTING_ARCANE.id && lastClearcastingSpender.length === 0) {
      return;
    }

    //Else, Reduce the cooldown of Mirrors of Torment
    if (this.spellUsable.isOnCooldown(SPELLS.MIRRORS_OF_TORMENT.id)) {
      this.spellUsable.reduceCooldown(
        SPELLS.MIRRORS_OF_TORMENT.id,
        MIRRORS_OF_TORMENT_REDUCTION_MS,
      );
    }
  }

  onDebuffRemoved(event: RemoveDebuffEvent | RemoveDebuffStackEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BLAST.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, FIRE_BLAST_REDUCTION_MS);
    }
  }
}

export default MirrorsOfTorment;
