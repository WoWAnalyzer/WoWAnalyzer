import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/paladin';
import Haste from 'parser/shared/modules/Haste';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { HOLY_POWER_FINISHERS } from '../../constants';

class Crusade extends Analyzer.withDependencies({ haste: Haste }) {
  #currentCrusadeHaste = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CRUSADE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(HOLY_POWER_FINISHERS),
      this.#onSpenderCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.AVENGING_WRATH_TALENT),
      this.#applyBaseCrusadeHasteBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.AVENGING_WRATH_TALENT),
      this.#resetCrusadeHasteBuff,
    );
  }

  #applyBaseCrusadeHasteBuff() {
    this.#currentCrusadeHaste = 0.02;
  }

  #resetCrusadeHasteBuff() {
    this.#currentCrusadeHaste = 0;
  }

  #updateCrusadeStacks(event: CastEvent): void {
    // For some reason HoL acts as if it consumed 9 Holy Power - as of 12.0.5
    const bonusHastePercent = event.ability.guid === SPELLS.HAMMER_OF_LIGHT.id ? 0.18 : 0.06;
    if (this.#currentCrusadeHaste + bonusHastePercent > 0.2) {
      this.#currentCrusadeHaste = 0.2;
    } else {
      this.#currentCrusadeHaste += bonusHastePercent;
    }
  }

  #onSpenderCast(event: CastEvent): void {
    if (!this.selectedCombatant.hasBuff(TALENTS.AVENGING_WRATH_TALENT)) {
      return;
    }
    this.#updateCrusadeStacks(event);
    this.deps.haste.updateHasteBuff(
      event,
      TALENTS.AVENGING_WRATH_TALENT.id,
      this.#currentCrusadeHaste,
    );
  }
}

export default Crusade;
