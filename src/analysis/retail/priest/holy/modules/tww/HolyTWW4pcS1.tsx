import Analyzer from 'parser/core/Analyzer';
import { CastEvent, GetRelatedEvents, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { TIERS } from 'game/TIERS';
import { SPELLS_THAT_PROC_S1_4PC_HOLY_ID } from '../../constants';
import { HOLY_TWW_S1_4PC } from '../../normalizers/CastLinkNormalizer';
import HolyWordCDR from '../core/HolyWordCDR';

class HolyTWW4pS1 extends Analyzer {
  static dependencies = {
    holyWordCDR: HolyWordCDR,
  };
  protected holyWordCDR!: HolyWordCDR;

  active4p = false;
  tierProcs = 0;
  validCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);
  }

  detect4pcProc(event: CastEvent): boolean {
    if (!SPELLS_THAT_PROC_S1_4PC_HOLY_ID.includes(event.ability.guid)) {
      return false;
    }

    this.validCasts += 1;

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

  handleCasts(event: CastEvent) {
    if (this.detect4pcProc(event)) {
      this.tierProcs += 1;
    }
  }
}

export default HolyTWW4pS1;
