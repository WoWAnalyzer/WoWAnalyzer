import SPELLS from 'common/SPELLS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Combatant from 'parser/core/Combatant';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { ERRATIC_FELHEART_SCALING } from 'analysis/retail/demonhunter/shared';

export function getInfernalStrikeBaseCooldown(combatant: Combatant) {
  const baseCooldown = 15;
  const erraticFelheartReduction =
    ERRATIC_FELHEART_SCALING[combatant.getTalentRank(TALENTS_DEMON_HUNTER.ERRATIC_FELHEART_TALENT)];
  return baseCooldown - erraticFelheartReduction;
}

export function getInfernalStrikeCooldown(combatant: Combatant, haste = 0) {
  return getInfernalStrikeBaseCooldown(combatant) / (1 + haste);
}

/*  When considering Infernal Strike, it is worth tracking how much time is spent overcapped on charges.
    Unless you are in a fight that requires quick back-to-back movement uses, it is best to use a charge of this before,
    or shortly after gaining a second use. */
export default class InfernalStrike extends Analyzer {
  infernalCasts = 0;
  infernalCharges = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.BLAZING_PATH_TALENT)
    ? 2
    : 1;
  lastCastTimestamp = 0;
  currentCastTimestamp = 0;
  castsAtCap = 0;
  secsOverCap = 0;

  constructor(options: Options) {
    super(options);
    /* TODO: Continue to monitor this if the logging ever gets fixed. Until then, this module won't work

        As of 9/24/2022 logging for infernal strikes is broken. Casts aren't recorded at all.
        Damage events are triggered, but this doesn't capture using the ability for mobility
    */

    this.addEventListener(
      Events.cast.spell(SPELLS.INFERNAL_STRIKE).by(SELECTED_PLAYER),
      this.onCast,
    );
  }

  get percentCastsAtCap() {
    return this.castsAtCap / this.infernalCasts;
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.percentCastsAtCap,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  onCast(event: CastEvent) {
    this.currentCastTimestamp = event.timestamp;
    const rechargeMs = getInfernalStrikeBaseCooldown(this.selectedCombatant) * 1000;

    // Track recharge
    if (this.currentCastTimestamp > this.lastCastTimestamp + rechargeMs) {
      this.infernalCharges += 1;
    }
    this.infernalCasts += 1;

    // Track overcapped data
    const maxCharges = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.BLAZING_PATH_TALENT)
      ? 2
      : 1;
    if (this.infernalCharges === maxCharges) {
      this.castsAtCap += 1;
      if (this.lastCastTimestamp > 0) {
        this.secsOverCap +=
          (this.currentCastTimestamp - this.lastCastTimestamp - rechargeMs) / 1000;
      }
    }

    this.infernalCharges -= 1;
    this.lastCastTimestamp = this.currentCastTimestamp;
  }
}
