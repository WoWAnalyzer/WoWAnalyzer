import { CastEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import {
  getDisintegrateTargetCount,
  getMassDisintegrateCast,
  isFromMassDisintegrate,
} from 'analysis/retail/evoker/devastation/modules/normalizers/CastLinkNormalizer';
import {
  getMassEruptionCast,
  getMassEruptionTargetCount,
  isFromMassEruption,
} from 'analysis/retail/evoker/augmentation/modules/normalizers/CastLinkNormalizer';
import {
  MASS_DISINTEGRATE_TARGETS,
  CONCENTRATED_POWER_EXTRA_TARGETS,
} from 'analysis/retail/evoker/shared/constants';

// Small helper to simplify calls regarding Mass Disintegrate/Eruption target counts.

export function getMassEventTargetCount(event: CastEvent, maxTargets?: number): number {
  // To-do: Fix getMassEruptionTargetCount so maxTargets isn't needed here either.
  // As a fallback, maxTargets assumes here that you do have Concentrated Power for Eruption, as this will always be the case in max level content currently.
  return Math.max(
    getDisintegrateTargetCount(event),
    getMassEruptionTargetCount(
      event,
      maxTargets || MASS_DISINTEGRATE_TARGETS + CONCENTRATED_POWER_EXTRA_TARGETS,
    ),
  );
}

export function isMassEvent(event: CastEvent | RemoveBuffEvent | RemoveBuffStackEvent): boolean {
  return isFromMassDisintegrate(event) || isFromMassEruption(event);
}

export function getMassCast(event: RemoveBuffEvent | RemoveBuffStackEvent): CastEvent | undefined {
  return getMassDisintegrateCast(event) || getMassEruptionCast(event);
}
