import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const REDUCTION_SHADOWFIEND = 4000;
const REDUCTION_MINDBENDER = 2000;

class VoidSummoner extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  spellID: number = SPELLS.SHADOWFIEND.id;
  cdrAmount: number = REDUCTION_SHADOWFIEND;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.VOID_SUMMONER_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS.MINDBENDER_DISCIPLINE_TALENT)) {
      this.spellID = TALENTS.MINDBENDER_DISCIPLINE_TALENT.id;
      this.cdrAmount = REDUCTION_MINDBENDER;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.SMITE,
          SPELLS.SHADOW_SMITE,
          SPELLS.MIND_BLAST,
          SPELLS.PENANCE_CAST,
          SPELLS.DARK_REPRIMAND_CAST,
          SPELLS.VOID_BLAST_DAMAGE_DISC,
        ]),
      this.onCdrCast,
    );
  }

  onCdrCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(this.spellID)) {
      this.spellUsable.reduceCooldown(this.spellID, this.cdrAmount, event.timestamp);
    }
  }
}

export default VoidSummoner;
