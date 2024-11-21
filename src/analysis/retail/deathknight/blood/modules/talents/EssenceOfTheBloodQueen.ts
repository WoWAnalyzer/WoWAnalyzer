import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';

// Essence of the Blood Queen is 1% haste per stack outside of Gift of the San'layn, and 3% haste per stack during it.
const ESSENCE_HASTE_NORMAL = 0.01;
const ESSENCE_HASTE_GIFT = 0.03;

export default class EssenceOfTheBloodQueen extends Analyzer.withDependencies({ haste: Haste }) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.VAMPIRIC_STRIKE_TALENT);

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.GIFT_OF_THE_SANLAYN_BUFF),
      this.onGiftApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.GIFT_OF_THE_SANLAYN_BUFF),
      this.onGiftRemove,
    );

    if (this.active) {
      this.deps.haste.addHasteBuff(SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id, {
        hastePerStack: ESSENCE_HASTE_NORMAL,
      });
    }
  }

  onGiftApply(event: ApplyBuffEvent) {
    this.deps.haste.updateHasteBuff(event, SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id, {
      hastePerStack: ESSENCE_HASTE_GIFT,
    });
  }

  onGiftRemove(event: RemoveBuffEvent) {
    this.deps.haste.updateHasteBuff(event, SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id, {
      hastePerStack: ESSENCE_HASTE_NORMAL,
    });
  }
}
