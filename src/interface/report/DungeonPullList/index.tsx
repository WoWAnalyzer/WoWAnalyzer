import { isMythicPlus } from 'common/isMythicPlus';
import Fight, { WCLDungeonPull } from 'parser/core/Fight';
import { JSX } from 'react';
import { DungeonPullDetails } from './DungeonPullListCombatParser';
import styles from './index.module.scss';
import { formatDurationMinSec, formatNumber, formatPercentage } from 'common/format';
import ActorLink from 'interface/ActorLink';
import SpellIcon from 'interface/SpellIcon';
import clsx from 'clsx';

export default function DungeonPullList({
  children,
  fight,
  details,
}: {
  children: React.ReactNode;
  fight: Fight;
  details?: DungeonPullDetails[];
}): JSX.Element | null {
  if (shouldShowDungeonPullList(fight, undefined)) {
    return (
      <section className={styles.Container}>
        {fight.dungeonPulls
          ?.filter((pull) => pull.end_time - pull.start_time > 100)
          .map((pull) => {
            const pullDetails = details?.find((det) => det.pull.id === pull.id);

            return <PullDetails pull={pull} details={pullDetails} fight={fight} />;
          })}
      </section>
    );
  }

  return <>{children}</>;
}

function PullDetails({
  pull,
  details,
  fight,
}: {
  pull: WCLDungeonPull;
  details?: DungeonPullDetails;
  fight: Fight;
}) {
  const countPct = (count: number) => `${formatPercentage(count / fight.countRequired!, 1)}%`;
  const time = (timestamp: number) =>
    `${formatDurationMinSec((timestamp - fight.start_time) / 1000)}`;
  return (
    <div className={styles.PullContainer}>
      <header>
        <span>
          Pull {pull.id} &mdash; {pull.name}
        </span>

        <span>
          {time(pull.start_time)} &mdash; {time(pull.end_time)}
        </span>

        {details && (
          <span>
            +{countPct(details.countGained)} ({countPct(details.countAtEnd - details.countGained)}{' '}
            &rarr; {countPct(details.countAtEnd)})
          </span>
        )}
      </header>

      {details && (
        <>
          <div>
            <strong>Cooldowns</strong>{' '}
            {details.cooldowns.map((id) => (
              <SpellIcon
                spell={id}
                className={clsx({
                  [styles.desaturatedIcon]: !details.cooldownsUsed.includes(id),
                })}
              />
            ))}
          </div>
          <div>
            <strong>Defensives</strong>
            {details.defensives.map((id) => (
              <SpellIcon
                spell={id}
                className={clsx({
                  [styles.desaturatedIcon]: !details.defensivesUsed.includes(id),
                })}
              />
            ))}
          </div>
          <div>
            <strong>DPS</strong>
            {formatNumber(details.dps)}
          </div>
          <div>
            <strong>HPS</strong>
            {formatNumber(details.hps)}
          </div>
          {details.deaths.length > 0 && (
            <div>
              <strong>Deaths</strong>
              {details.deaths.map((death) => (
                <span>
                  <ActorLink id={death.targetID} /> (at{' '}
                  {formatDurationMinSec((death.timestamp - pull.start_time) / 1000)} into the pull)
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function shouldShowDungeonPullList(fight: Fight, selectedPull?: unknown): boolean {
  return isMythicPlus(fight) && !selectedPull;
}
