import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';

import { TALENTS_PRIEST } from 'common/TALENTS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TIERS } from 'game/TIERS';
import { CastEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/priest';
import {
  APOTH_MULTIPIER,
  baseHolyWordCDR,
  chastiseHWCDR,
  energyCycleCDR,
  HOLY_ENERGY_CYCLE_PROC,
  HOLY_TWW_S1_4PC_CDR,
  LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK,
  sanctifyHWCDR,
  serenityHWCDR,
  TWW_S1_HOLY_4PC_CDR_PROC,
  TWW_TIER1_2PC_CDR,
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
  private twwS1TierMult = 1;

  private chastiseActive = false;
  private sanctifyActive = false;
  private salvationActive = false;
  //serenity is always active

  constructor(options: Options) {
    super(options);

    // The below 3 if statements scale the CDR base on talents/gear
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT)) {
      this.lotnMult =
        this.selectedCombatant.getTalentRank(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT) *
          LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK +
        1;
    }

    if (this.selectedCombatant.has2PieceByTier(TIERS.TWW1)) {
      this.twwS1TierMult = TWW_TIER1_2PC_CDR + 1;
    }

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.VOICE_OF_HARMONY_TALENT)) {
      this.baseVohMult =
        0.5 * this.selectedCombatant.getTalentRank(TALENTS_PRIEST.VOICE_OF_HARMONY_TALENT);
    }

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.HOLY_WORD_CHASTISE_TALENT)) {
      this.chastiseActive = true;
    }

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT)) {
      this.sanctifyActive = true;
    }
    this.baseHolyWordCDR = this.lotnMult * this.twwS1TierMult;
  }

  public handleAny(event: CastEvent, specialEvent?: string): hwCDRBreakdown | undefined {
    //energy cycle special events
    if (specialEvent === HOLY_ENERGY_CYCLE_PROC) {
      return this.handleCDR(
        energyCycleCDR.get(TALENTS.ENERGY_CYCLE_TALENT.id),
        TALENTS.HOLY_WORD_SANCTIFY_TALENT.id,
      );
    }
    // 4pc special events
    if (
      sanctifyHWCDR.has(event.ability.guid) &&
      this.sanctifyActive &&
      specialEvent === TWW_S1_HOLY_4PC_CDR_PROC
    ) {
      return this.handleCDR(
        sanctifyHWCDR.get(event.ability.guid),
        TALENTS.HOLY_WORD_SANCTIFY_TALENT.id,
        specialEvent,
      );
    }
    if (serenityHWCDR.has(event.ability.guid) && specialEvent === TWW_S1_HOLY_4PC_CDR_PROC) {
      return this.handleCDR(
        serenityHWCDR.get(event.ability.guid),
        TALENTS.HOLY_WORD_SERENITY_TALENT.id,
        specialEvent,
      );
    }
    //base events
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
   * this function is called by one of the above handlers and returns a breakdown of what effects contributed to
   * holy word CDR effects.
   *
   * if vohAffectsBase is ever true, attribute the entire base to voice of harmony
   *
   * this takes a baseHolyWordCDR type, you can manually write one to fit in special cases
   */

  private handleCDR(
    hwMap: baseHolyWordCDR | undefined,
    hwToReduceId: number,
    specialMod?: string,
  ): hwCDRBreakdown | undefined {
    let baseMult = 1;
    let modHolyWordCDR = this.baseHolyWordCDR;
    let apothMult = 1;
    let tier4pcMult = 1;

    if (this.selectedCombatant.hasBuff(TALENTS.APOTHEOSIS_TALENT) && !hwMap?.apothDisable) {
      modHolyWordCDR *= 1 + APOTH_MULTIPIER;
      apothMult = 1 + APOTH_MULTIPIER;
    }

    if (hwMap?.vohDependent) {
      baseMult = this.baseVohMult;
    }

    if (specialMod === '4PC') {
      modHolyWordCDR *= 1 + HOLY_TWW_S1_4PC_CDR;
      tier4pcMult *= 1 + HOLY_TWW_S1_4PC_CDR;
    }

    // At this point all modifiers should be settled, if blizzard ever adds a new modifier
    // add it into the calcs somewhere here

    // TODO: twws1 tier set supposedly scales the CDR down to 35% effectiveness
    //       if this is true, if(getRelatedEvents(tier proc)) -> multipliers cut down to 0.35

    const baseCDR = (hwMap?.baseCDR || 0) * baseMult;
    const idealCDR = baseCDR * modHolyWordCDR;
    const actualCDR = this.spellUsable.reduceCooldown(hwToReduceId, idealCDR);

    // if there is no base CDR, then a VoH spell was passed and VoH was not specced, return 0
    if (baseCDR === 0) {
      return;
    }
    // if base CDR is larger than actual CDR none of the modifiers mattered
    else if (baseCDR >= actualCDR) {
      return {
        idealTotalCDR: idealCDR,
        actualTotalCDR: actualCDR,
        cdrFromBase: actualCDR,
        cdrFromLOTN: 0,
        cdrFromApoth: 0,
        cdrFromTwwTier: 0,
        cdrFrom4pc: 0,
        vohAffectsBase: hwMap?.vohDependent,
        affectedSpell: hwToReduceId,
      };
    }

    const cdrScaler = (actualCDR - baseCDR) / (idealCDR - baseCDR);

    return {
      idealTotalCDR: idealCDR,
      actualTotalCDR: actualCDR,
      cdrFromBase: baseCDR,
      cdrFromLOTN: this.getCDRComponent(idealCDR, cdrScaler, this.lotnMult),
      cdrFromApoth: this.getCDRComponent(idealCDR, cdrScaler, apothMult),
      cdrFromTwwTier: this.getCDRComponent(idealCDR, cdrScaler, this.twwS1TierMult),
      cdrFrom4pc: this.getCDRComponent(idealCDR, cdrScaler, tier4pcMult),
      vohAffectsBase: hwMap?.vohDependent,
      affectedSpell: hwToReduceId,
    };
  }

  // figure out what the other multipliers combine to without and minus from total
  private getCDRComponent(idealCDR: number, cdrScaler: number, amp: number): number {
    return cdrScaler * (idealCDR - idealCDR / amp);
  }
}

// If vohAffectsBase is true, the attribute base CDR to Voice of Harmony
// can directly add new effects as needed
interface hwCDRBreakdown {
  idealTotalCDR: number;
  actualTotalCDR: number;
  cdrFromBase: number;
  cdrFromLOTN: number;
  cdrFromApoth: number;
  cdrFromTwwTier: number;
  cdrFrom4pc: number;
  vohAffectsBase: boolean | undefined;
  affectedSpell: number;
}

export default HolyWordCDR;
