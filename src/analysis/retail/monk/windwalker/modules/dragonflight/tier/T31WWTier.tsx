import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import SpellUsable from '../../core/SpellUsable';

const FOUR_PIECE_CD_REDUCTION_MS = 3 * 1000; // 3 seconds
const FOUR_PIECE_SPELL_MOD = [
  SPELLS.FISTS_OF_FURY_CAST,
  TALENTS_MONK.RISING_SUN_KICK_TALENT,
  TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT,
  TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT,
];

class T31TierSet extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };
  protected combatants!: Combatants;
  protected spellUsable!: SpellUsable;

  has2Piece: boolean = true;
  has4Piece: boolean = true;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.DF3);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.DF3) && this.has2Piece;

    this.active = this.has2Piece;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_REINFORCEMENT),
      this.consumed,
    );
  }

  consumed() {
    if (this.has4Piece) {
      FOUR_PIECE_SPELL_MOD.forEach((spell) => {
        this.spellUsable.reduceCooldown(spell.id, FOUR_PIECE_CD_REDUCTION_MS);
      });
    }
  }
}

export default T31TierSet;
