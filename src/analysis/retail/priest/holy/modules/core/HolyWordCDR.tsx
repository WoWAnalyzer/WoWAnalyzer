import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';

import { TALENTS_PRIEST } from 'common/TALENTS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { CastEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/priest';
import {
  APOTH_MULTIPIER,
  baseHolyWordCDR,
  chastiseHWCDR,
  energyCycleCDR,
  HOLY_ENERGY_CYCLE_PROC,
  LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK,
  sanctifyHWCDR,
  serenityHWCDR,
} from '../../constants';

/**
 * This module drives all holy word CDR evaluations, use as a dependency and call one of the public handlers
 * or make a new one
 */

class HolyWordCDR extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  protected combatants!: Combatants;
  protected spellUsable!: SpellUsable;

  private baseHolyWordCDR = 1;
  private baseVohMult = 0;
  private lotnMult = 1;

  private chastiseActive = false;
  private sanctifyActive = false;
  // serenity is always active

  constructor(options: Options) {
    super(options);

    // Light of the Naaru
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT)) {
      this.lotnMult =
        this.selectedCombatant.getTalentRank(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT) *
          LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK +
        1;
    }

    // Voice of Harmony
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.VOICE_OF_HARMONY_TALENT)) {
      this.baseVohMult =
        0.5 * this.selectedCombatant.getTalentRank(TALENTS_PRIEST.VOICE_OF_HARMONY_TALENT);
    }

    // Which Holy Words are talented
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.HOLY_WORD_CHASTISE_TALENT)) {
      this.chastiseActive = true;
    }
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT)) {
      this.sanctifyActive = true;
    }

    // Base CDR multiplier = Light of the Naaru only (no tier set)
    this.baseHolyWordCDR = this.lotnMult;
  }

  public handleAny(event: CastEvent, specialEvent?: string): hwCDRBreakdown | undefined {
    // Energy Cycle special event (from Archon)
    if (specialEvent === HOLY_ENERGY_CYCLE_PROC) {
      return this.handleCDR(
        energyCycleCDR.get(TALENTS.ENERGY_CYCLE_TALENT.id),
        TALENTS.HOLY_WORD_SANCTIFY_TALENT.id,
      );
    }

    // Base events
    if (chastiseHWCDR.has(event.ability.guid) && this.chastiseActive) {
      return this.handleCDR(
        chastiseHWCDR.get(event.ability.guid),
        TALENTS.HOLY_WORD_CHASTISE_TALENT.id,
      );
    }
    if (sanctifyHWCDR.has(event.ability.guid) && this.sanctifyActive) {
      return this.handleCDR(
        sanctifyHWCDR.get(event.ability.guid),
        TALENTS.HOLY_WORD_SANCTIFY_TALENT.id,
      );
    }
    if (serenityHWCDR.has(event.ability.guid)) {
      return this.handleCDR(
        serenityHWCDR.get(event.ability.guid),
        TALENTS.HOLY_WORD_SERENITY_TALENT.id,
      );
    }
  }

  /**
   * Called by handlers – returns breakdown of CDR sources.
   * If vohAffectsBase, the entire base CDR is attributed to Voice of Harmony.
   */
  private handleCDR(
    hwMap: baseHolyWordCDR | undefined,
    hwToReduceId: number,
    specialMod?: string, // currently only used for Energy Cycle, but kept for future
  ): hwCDRBreakdown | undefined {
    let baseMult = 1;
    let modHolyWordCDR = this.baseHolyWordCDR;
    let apothMult = 1;

    // Apotheosis buff active? (exclude if map says apothDisable)
    if (this.selectedCombatant.hasBuff(TALENTS.APOTHEOSIS_TALENT) && !hwMap?.apothDisable) {
      modHolyWordCDR *= 1 + APOTH_MULTIPIER;
      apothMult = 1 + APOTH_MULTIPIER;
    }

    // Voice of Harmony – if this ability's CDR depends on VoH, baseMult becomes the VoH multiplier
    if (hwMap?.vohDependent) {
      baseMult = this.baseVohMult;
    }

    // Base CDR value (in seconds)
    const baseCDR = (hwMap?.baseCDR || 0) * baseMult;
    // Ideal total CDR after all multipliers (seconds)
    const idealCDR = baseCDR * modHolyWordCDR;

    // Convert to milliseconds before passing to reduceCooldown
    const idealCDRms = Math.round(idealCDR * 1000);
    const actualCDRms = this.spellUsable.reduceCooldown(hwToReduceId, idealCDRms);

    // If no base CDR (shouldn't happen), return nothing
    if (baseCDR === 0) {
      return;
    }

    // Convert actual CDR back to seconds for the breakdown (keep as float for display)
    const actualCDR = actualCDRms / 1000;

    // If modifiers didn't matter (actual <= base), return a simplified breakdown
    if (baseCDR >= actualCDR) {
      return {
        idealTotalCDR: idealCDR,
        actualTotalCDR: actualCDR,
        cdrFromBase: actualCDR,
        cdrFromLOTN: 0,
        cdrFromApoth: 0,
        vohAffectsBase: hwMap?.vohDependent,
        affectedSpell: hwToReduceId,
      };
    }

    // Scale the component contributions based on how much of the ideal was actually realized
    const cdrScaler = (actualCDR - baseCDR) / (idealCDR - baseCDR);

    return {
      idealTotalCDR: idealCDR,
      actualTotalCDR: actualCDR,
      cdrFromBase: baseCDR,
      cdrFromLOTN: this.getCDRComponent(idealCDR, cdrScaler, this.lotnMult),
      cdrFromApoth: this.getCDRComponent(idealCDR, cdrScaler, apothMult),
      vohAffectsBase: hwMap?.vohDependent,
      affectedSpell: hwToReduceId,
    };
  }

  // Helper: compute contribution of a specific multiplier
  private getCDRComponent(idealCDR: number, cdrScaler: number, amp: number): number {
    // Contribution = scaler * (ideal - ideal/amp)
    return cdrScaler * (idealCDR - idealCDR / amp);
  }
}

// Breakdown interface (TWW tier removed)
interface hwCDRBreakdown {
  idealTotalCDR: number; // total CDR that would have happened if no waste (seconds)
  actualTotalCDR: number; // actual CDR after waste (seconds)
  cdrFromBase: number; // base CDR (seconds)
  cdrFromLOTN: number; // Light of the Naaru contribution (seconds)
  cdrFromApoth: number; // Apotheosis contribution (seconds)
  vohAffectsBase: boolean | undefined; // whether base came from Voice of Harmony
  affectedSpell: number; // which Holy Word was reduced
}

export default HolyWordCDR;