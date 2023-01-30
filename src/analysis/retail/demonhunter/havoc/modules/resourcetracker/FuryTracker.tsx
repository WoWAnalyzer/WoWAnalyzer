import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

// Casting Eye Beam at over 50 when you have the Blind Fury talent is considered a waste.
const BLIND_FURY_WASTE_CUTOFF = 50;

export const PERFECT_TIME_AT_FURY_CAP = 0.15;
export const GOOD_TIME_AT_FURY_CAP = 0.2;
export const OK_TIME_AT_FURY_CAP = 0.25;

class FuryTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellUsable: SpellUsable,
  };

  waste = 0;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.FURY;
  }

  get percentAtCapPerformance(): QualitativePerformance {
    const percentAtCap = this.percentAtCap;
    if (percentAtCap <= PERFECT_TIME_AT_FURY_CAP) {
      return QualitativePerformance.Perfect;
    }
    if (percentAtCap <= GOOD_TIME_AT_FURY_CAP) {
      return QualitativePerformance.Good;
    }
    if (percentAtCap <= OK_TIME_AT_FURY_CAP) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const classResource = event.classResources?.[0];
    //TODO: Account for Eye Beam clipping
    // Blind Fury resource gain does not have an energize event so it is handled here
    if (
      spellId === TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id &&
      this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.BLIND_FURY_TALENT) &&
      classResource
    ) {
      this.waste = classResource.amount - BLIND_FURY_WASTE_CUTOFF;
      if (this.waste <= 0) {
        this.waste = 0;
      }
      const AMOUNT = classResource.max - classResource.amount + this.waste;
      this.processInvisibleEnergize(
        TALENTS_DEMON_HUNTER.BLIND_FURY_TALENT.id,
        AMOUNT,
        event.timestamp,
      );
    }
    super.onCast(event);
  }
}

export default FuryTracker;
