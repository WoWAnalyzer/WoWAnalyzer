import { UsageInfo } from 'parser/core/SpellUsage/core';
import React from 'react';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SEPSIS_DEBUFF_DURATION } from '../../normalizers/SepsisLinkNormalizer';
import { formatPercentage } from 'common/format';
import { CAST_BUFFER_MS } from '../../normalizers/CastLinkNormalizer';
import formatSeconds from './formatSeconds';
import { BASE_ROGUE_GCD, SHIV_DURATION } from './Sepsis';
import CombatLogParser from 'parser/core/CombatLogParser';
import SepsisCast from './interfaces/SepsisCast';

type Props = {
  cast: SepsisCast;
  owner: CombatLogParser;
};

const ShivPerformance = ({ cast, owner }: Props): UsageInfo | undefined => {
  const shivSummary: React.ReactNode = (
    <>
      Cast <SpellLink spell={SPELLS.SHIV} /> shortly after applying{' '}
      <SpellLink spell={TALENTS.SEPSIS_TALENT} />.
    </>
  );
  let castDetails: React.ReactNode = (
    <>
      You did not cast <SpellLink spell={SPELLS.SHIV.id} /> during{' '}
      <SpellLink spell={TALENTS.SEPSIS_TALENT.id} />.
    </>
  );
  let performance = QualitativePerformance.Fail;

  // Note: cast.debuff & cast.shivData will be defined if shivCasts > 0
  // check is redundant but here for typing purposes
  const shivCasts = cast.shivData?.events.length || 0;
  if (shivCasts > 0 && cast.debuff && cast.shivData) {
    const { events, overlapMs, overlapPercent } = cast.shivData;
    if (overlapPercent >= 0.9) {
      performance = QualitativePerformance.Perfect;
    } else if (overlapPercent >= 0.8) {
      performance = QualitativePerformance.Good;
    } else if (overlapPercent >= 0.65) {
      performance = QualitativePerformance.Ok;
    }
    const sepsisRemainingonFightEnd =
      cast.debuff.start + SEPSIS_DEBUFF_DURATION - owner.fight.end_time;
    castDetails = (
      <>
        You cast {shivCasts} <SpellLink spell={SPELLS.SHIV} />
        (s) with {formatSeconds(overlapMs, 2)}s ({formatPercentage(overlapPercent, 1)}
        %) of it's debuff covering your <SpellLink spell={TALENTS.SEPSIS_TALENT} /> debuff.{' '}
      </>
    );
    if (overlapPercent < 0.85) {
      let additionalDetails: React.ReactNode = <></>;
      additionalDetails = (
        <>
          Aim to have all {formatSeconds(SHIV_DURATION)} seconds of the Shiv debuff line up with the{' '}
          {formatSeconds(SEPSIS_DEBUFF_DURATION)}s Sepsis DoT.
        </>
      );
      // Edge case for last sepsis cast
      if (sepsisRemainingonFightEnd > 0) {
        // Check to see if last Shiv cast comes before the 3rd GCD after sepsis.
        // if the shiv was cast within 1-2GCDs assume it would've been `Perfect`
        const castTimeDiff = Math.abs(events[shivCasts - 1].start - cast.debuff.start);
        const withinGracePeriod = castTimeDiff < 3 * BASE_ROGUE_GCD + CAST_BUFFER_MS;

        performance = withinGracePeriod
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Good;
        additionalDetails = (
          <>
            The fight ended after{' '}
            {formatSeconds(SEPSIS_DEBUFF_DURATION - sepsisRemainingonFightEnd)} seconds of{' '}
            <SpellLink spell={TALENTS.SEPSIS_TALENT} />
            {withinGracePeriod ? '.' : ', but Shiv could have still been used earlier.'}{' '}
          </>
        );
        castDetails = (
          <>
            {castDetails} {additionalDetails}
          </>
        );
      }
    }
  }
  return {
    performance: performance,
    summary: shivSummary,
    details: <div>{castDetails}</div>,
  };
};

export default ShivPerformance;
