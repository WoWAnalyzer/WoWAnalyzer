import { UsageInfo } from 'parser/core/SpellUsage/core';
import React from 'react';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SEPSIS_BUFF_DURATION } from '../../normalizers/SepsisLinkNormalizer';
import { GARROTE_BASE_DURATION, isInOpener } from '../../constants';
import formatSeconds from './formatSeconds';
import { PRIMARY_BUFF_KEY, SECONDARY_BUFF_KEY } from './Sepsis';
import CombatLogParser from 'parser/core/CombatLogParser';
import SepsisCast from './interfaces/SepsisCast';

type Props = {
  cast: SepsisCast;
  buffId: keyof SepsisCast['buffs'];
  owner: CombatLogParser;
};

const BuffUsagePerformance = ({ buffId, cast, owner }: Props): UsageInfo | undefined => {
  const summaryForBuff = {
    [PRIMARY_BUFF_KEY]: (
      <>
        Use <SpellLink spell={SPELLS.GARROTE} /> to consume the Sepsis buff early.
      </>
    ) as React.ReactNode,
    [SECONDARY_BUFF_KEY]: (
      <>
        Use <SpellLink spell={SPELLS.GARROTE} /> to consume the Sepsis buff late.
      </>
    ) as React.ReactNode,
  };
  const usageDetails = {
    [PRIMARY_BUFF_KEY]: (
      <>
        You did not consume the first <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff.
      </>
    ) as React.ReactNode,
    [SECONDARY_BUFF_KEY]: (
      <>
        You did not consume the second <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff.
      </>
    ) as React.ReactNode,
  };
  let buffPerformance = QualitativePerformance.Fail;
  const buff = cast.buffs[buffId];
  if (buff && buff.consumeCast) {
    const firstOrSecond = buffId === PRIMARY_BUFF_KEY ? 'first' : 'second';
    if (buff.consumeCast.ability.guid !== SPELLS.GARROTE.id) {
      usageDetails[buffId] = (
        <>
          You incorrectly cast <SpellLink spell={buff.consumeCast.ability.guid} /> to consume the{' '}
          {firstOrSecond} <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff. You should always be using
          the buff to cast or extend an empowered <SpellLink spell={SPELLS.GARROTE} />.
        </>
      );
    } else {
      buffPerformance = QualitativePerformance.Perfect;
      usageDetails[buffId] = (
        <>
          You cast <SpellLink spell={SPELLS.GARROTE} /> to consume the {firstOrSecond}{' '}
          <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff with{' '}
          {formatSeconds(buff.timeRemainingOnRemoval, 2)} seconds remaining on it's duration.
        </>
      );
      // If the applied garrote will outlast (ie its not "full") the fight then disregard any "early" or "late" consume rules
      const expectedGarroteEnd = buff.consumeCast.timestamp + GARROTE_BASE_DURATION;
      const willBeFullGarrote = expectedGarroteEnd < owner.fight.end_time;

      // Primary buff specific checks
      if (buffId === PRIMARY_BUFF_KEY) {
        const isLateConsume = buff.timeRemainingOnRemoval < 5 * 1000;
        const isOpenerCast = isInOpener(buff.consumeCast, owner.fight);
        // still good, just not "perfect"
        if (isLateConsume && !isOpenerCast && willBeFullGarrote) {
          buffPerformance = QualitativePerformance.Good;
          usageDetails[buffId] = (
            <>
              {usageDetails[buffId]} You should consider using the first buff earlier to get an
              empowered <SpellLink spell={SPELLS.GARROTE} /> ticking as soon as possible. Specially
              outside of the opener as you likely will not have an{' '}
              <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> running when you cast{' '}
              <SpellLink spell={TALENTS.SEPSIS_TALENT} />
            </>
          );
        }
      }
      // Secondary buff specific checks
      if (buffId === SECONDARY_BUFF_KEY) {
        const isEarlyConsume = buff.timeRemainingOnRemoval > 3 * 1000;
        // likewise, still good, just not "perfect"
        if (isEarlyConsume && willBeFullGarrote) {
          buffPerformance = QualitativePerformance.Good;
          usageDetails[buffId] = (
            <>
              {usageDetails[buffId]} Consider using the second buff as late as possible to maximize
              uptime on <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} />
            </>
          );
        }
      }
    }
  }
  // Edge case: if fight ends before 2nd buff is gained or before buff is used.
  if (cast.event.timestamp + SEPSIS_BUFF_DURATION > owner.fight.end_time) {
    buffPerformance = QualitativePerformance.Perfect;
    if (!buff) {
      usageDetails[buffId] = (
        <>
          Fight ended before you gained the <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff.
        </>
      );
    } else if (!buff.consumeCast) {
      usageDetails[buffId] = (
        <>
          {usageDetails[buffId]} However, its seems the fight ended shortly after the buff was
          gained.
        </>
      );
    }
  }

  return {
    performance: buffPerformance,
    summary: <div>{summaryForBuff[buffId]}</div>,
    details: <div>{usageDetails[buffId]}</div>,
  };
};

export default BuffUsagePerformance;
