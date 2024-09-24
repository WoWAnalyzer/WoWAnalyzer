import Analyzer from 'parser/core/Analyzer';
import { CastEvent, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { SPELLS_THAT_PROC_S1_4PC_HOLY_ID } from '../../constants';
import { HOLY_TWW_S1_4PC } from '../../normalizers/CastLinkNormalizer';
import HolyWordCDR from '../core/HolyWordCDR';
import HIT_TYPES from 'game/HIT_TYPES';
import EOLAttrib from '../core/EchoOfLightAttributor';

class HolyTWW4pS1 extends Analyzer {
  static dependencies = {
    holyWordCDR: HolyWordCDR,
    eolAttrib: EOLAttrib,
  };
  protected holyWordCDR!: HolyWordCDR;

  protected eolAttrib!: EOLAttrib;

  active4p = false;

  // If a heal event hits the same person twice then its a tier proc
  is4pcProc(event: CastEvent): boolean {
    if (!SPELLS_THAT_PROC_S1_4PC_HOLY_ID.includes(event.ability.guid)) {
      return false;
    }

    const targets: number[] = [];
    let proc4pc = false;
    const events = GetRelatedEvents(event, HOLY_TWW_S1_4PC);
    if (events.length > 1) {
      events.forEach((castHeals) => {
        castHeals = castHeals as HealEvent;
        if (castHeals.targetID) {
          targets.push(castHeals.targetID);
        }
      });
    }
    if (new Set(targets).size < targets.length) {
      proc4pc = true;
    }
    console.log(targets);
    return proc4pc;
  }

  // Gets all heal events associated with a cast, below the average its a tier proc (0.35 scaling of base effect)
  get4pcHealing(event: CastEvent) {
    const events = GetRelatedEvents(event, HOLY_TWW_S1_4PC);
    let averageRawHeal = 0;
    let event4pcHealing = 0;
    let eol4pcHealing = 0;
    const healBreakdown: number[] = [0, 0];
    if (events.length > 1) {
      events.forEach((castHeals) => {
        castHeals = castHeals as HealEvent;
        const rawHeal = castHeals.amount + (castHeals.absorbed || 0) + (castHeals.overheal || 0);
        if (castHeals.hitType === HIT_TYPES.CRIT) {
          averageRawHeal += rawHeal / 2;
        } else {
          averageRawHeal += rawHeal;
        }
      });
      events.forEach((castHeals) => {
        castHeals = castHeals as HealEvent;
        const rawHeal = castHeals.amount + (castHeals.absorbed || 0) + (castHeals.overheal || 0);
        let tempRawHeal = 0;
        if (castHeals.hitType === HIT_TYPES.CRIT) {
          tempRawHeal = rawHeal / 2;
        } else {
          tempRawHeal = rawHeal;
        }
        if (tempRawHeal < averageRawHeal / events.length) {
          event4pcHealing += castHeals.amount + (castHeals.absorbed || 0);
          eol4pcHealing += this.eolAttrib.getEchoOfLightHealingAttrib(castHeals);
        }
      });
    }
    healBreakdown[0] = event4pcHealing;
    healBreakdown[1] = eol4pcHealing;

    return healBreakdown;
  }
}

export default HolyTWW4pS1;
