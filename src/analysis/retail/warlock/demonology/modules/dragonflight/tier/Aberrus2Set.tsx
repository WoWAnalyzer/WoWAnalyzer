import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 *  Demonbolt damage increased 15%. Consuming a Demonic Core reduces the cooldown of  Grimoire: Felguard by 1 second.
 */

const TWO_PIECE_CDR = 1000;

class DemonologyWarlockAberrus2Set extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  hasDemonicCore: boolean = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onDemonboltCast,
    );
  }

  onApplyBuff() {
    this.hasDemonicCore = true;
  }

  onRemoveBuff() {
    this.hasDemonicCore = false;
  }

  onDemonboltCast(event: CastEvent) {
    if (this.hasDemonicCore) {
      this.spellUsable.reduceCooldown(
        TALENTS_WARLOCK.GRIMOIRE_FELGUARD_TALENT.id,
        TWO_PIECE_CDR,
        event.timestamp,
      );
    }
  }
}

export default DemonologyWarlockAberrus2Set;
