import { isMythicPlus } from 'common/isMythicPlus';
import Fight, { WCLDungeonPull, WCLFight } from 'parser/core/Fight';
import { JSX, useCallback, useMemo } from 'react';
import { DungeonPullDetails } from './DungeonPullListCombatParser';
import styles from './index.module.scss';
import { formatDurationMinSec, formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'interface/SpellIcon';
import clsx from 'clsx';
import { useReport } from '../context/ReportContext';
import Report from 'parser/core/Report';
import { CooldownIcon, DamageIcon, SkullIcon } from 'interface/icons';
import { iconUrl } from 'interface/Icon';
import Tooltip from 'interface/Tooltip';
import Button from 'interface/controls/Button';
import { Trans } from '@lingui/react/macro';
import { ByRole, Role } from 'interface/guide/foundation/ByRole';
import ActorLink from 'interface/ActorLink';
import SpellLink from 'interface/SpellLink';
import { useSearchParams } from 'react-router-dom';
import SPELLS from 'common/SPELLS';
import LoadingSpinner from 'interface/LoadingSpinner';

const MIN_PULL_DURATION_MS = 100;

export type SelectedDungeonPull = 'all' | WCLDungeonPull | undefined;

export function useSelectedPull(
  fight: WCLFight,
): [SelectedDungeonPull, (pull: SelectedDungeonPull) => void] {
  const [search, setSearch] = useSearchParams();

  const setSelectedPull = useCallback(
    (pull: SelectedDungeonPull) => {
      if (pull === undefined) {
        setSearch((prev) => {
          prev.delete('pull');
          return prev;
        });
      } else if (pull === 'all') {
        setSearch({ pull: 'all' });
      } else {
        setSearch({
          pull: String(pull.id),
        });
      }
    },
    [setSearch],
  );

  if (search.has('pull')) {
    const pullId = search.get('pull');
    if (pullId === 'all') {
      return ['all', setSelectedPull];
    } else {
      const pullNum = Number.parseInt(pullId!);
      const pull = fight.dungeonPulls?.find((pull) => pull.id === pullNum);
      if (!pull) {
        setSelectedPull(undefined);
      }

      return [pull, setSelectedPull];
    }
  } else {
    return [undefined, setSelectedPull];
  }
}

export default function DungeonPullList({
  fight,
  details,
}: {
  fight: Fight;
  details?: DungeonPullDetails[];
}): JSX.Element | null {
  const [, setSelectedPull] = useSelectedPull(fight);
  const missingAnyDetails = useMemo(() => {
    if (!details) {
      return true;
    }

    if (!fight.dungeonPulls) {
      return true;
    }

    return fight.dungeonPulls!.some(
      (pull) =>
        details.find((det) => det.pull.id === pull.id) === undefined &&
        pull.end_time - pull.start_time > MIN_PULL_DURATION_MS,
    );
  }, [fight.dungeonPulls, details]);

  let isFirstWithoutDetails = true;

  return (
    <section className={styles.Container}>
      <header>
        <div className={styles.SelectPullLabel}>
          <Trans id="interface.report.selectPull">Select a Pull</Trans>
        </div>
        <Button
          className={styles.ViewEntireDungeonButton}
          onClick={() => setSelectedPull('all')}
          disabled={missingAnyDetails}
        >
          <Trans id="interface.report.viewEntireDungeon">View Entire Dungeon</Trans>
        </Button>
      </header>
      <div className={styles.PullListGrid}>
        {fight.dungeonPulls
          ?.filter((pull) => pull.end_time - pull.start_time > MIN_PULL_DURATION_MS)
          .map((pull) => {
            const pullDetails = details?.find((det) => det.pull.id === pull.id);
            const showSpinner = isFirstWithoutDetails && !pullDetails;
            if (showSpinner) {
              isFirstWithoutDetails = false;
            }

            return (
              <PullDetails
                key={pull.id}
                pull={pull}
                details={pullDetails}
                fight={fight}
                showSpinner={showSpinner}
                onClick={() => setSelectedPull(pull)}
              />
            );
          })}
      </div>
    </section>
  );
}

function PullDetails({
  pull,
  details,
  fight,
  onClick,
  showSpinner,
}: {
  pull: WCLDungeonPull;
  details?: DungeonPullDetails;
  fight: Fight;
  onClick: () => void;
  showSpinner: boolean;
}) {
  const dps = details && (
    <span title="DPS">
      <DamageIcon />
      {formatNumber(details.dps)}
    </span>
  );

  const hps = details && (
    <span title="HPS">
      <img src="/img/healing.png" alt="HPS" className="icon" />
      {formatNumber(details.hps)}
    </span>
  );
  return (
    <div
      className={clsx(styles.PullContainer, !details && styles.PullContainerDisabled)}
      onClick={details ? onClick : undefined}
      aria-disabled={!details}
    >
      <PullDetailsTitleBlock pull={pull} fight={fight} details={details} />
      {showSpinner && <LoadingSpinner className={styles.LoadingSpinner} />}
      {!showSpinner && details && (
        <>
          {details.bloodlustUsed ? (
            <SpellIcon className={styles.BloodlustIcon} spell={SPELLS.BLOODLUST} />
          ) : (
            <div />
          )}
          <ByRole>
            <Role.Tank>
              <InsetContainer className={clsx(styles.PerSecondContainer, styles.DoubleWide)}>
                {dps} {hps}
              </InsetContainer>
            </Role.Tank>
            <Role.Healer>
              <InsetContainer className={clsx(styles.PerSecondContainer, styles.DoubleWide)}>
                {hps} {dps}
              </InsetContainer>
            </Role.Healer>
            <Role.DPS>
              <InsetContainer className={styles.PerSecondContainer}>{dps}</InsetContainer>
            </Role.DPS>
          </ByRole>
          <AbilityList
            abilities={details.cooldowns}
            activeAbilities={details.cooldownsUsed}
            label={
              <Tooltip content="Cooldowns">
                <div>
                  <CooldownIcon />
                </div>
              </Tooltip>
            }
          />
          <AbilityList
            abilities={details.defensives}
            activeAbilities={details.defensivesUsed}
            label={
              <Tooltip content="Defensive Cooldowns">
                <div>
                  <img className={styles.shieldIcon} src="/img/shield.png" />
                </div>
              </Tooltip>
            }
          />
          {details.deaths.length > 0 ? (
            <InsetContainer className={styles.DeathsContainer}>
              Deaths: {/* FIXME: being the only one with a text label is weird */}
              {details.deaths.map((death) => (
                <Tooltip
                  key={`${death.timestamp}-${death.targetID}`}
                  content={
                    <>
                      <ActorLink id={death.targetID} /> died to{' '}
                      <SpellLink spell={death.killingAbility?.guid ?? 0} />
                    </>
                  }
                >
                  <div>
                    <ActorLink id={death.targetID}>{''}</ActorLink>
                  </div>
                </Tooltip>
              ))}
            </InsetContainer>
          ) : (
            <div />
          )}
          <div className={styles.ViewButton}>
            <span>
              View
              <span className="glyphicon glyphicon-chevron-right" aria-hidden />
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function pullIcon(pull: WCLDungeonPull, report: Report): string | undefined {
  let matchingEnemy = report.enemies.find(
    (enemy) => enemy.name === pull.name && pull.enemyNPCs?.some((npc) => npc.id === enemy.id),
  );

  if (!matchingEnemy) {
    matchingEnemy = pull.enemyNPCs
      ?.map((npc) => report.enemies.find((enemy) => enemy.id === npc.id))
      .filter(Boolean)
      .at(0);
  }

  return matchingEnemy?.icon ? iconUrl(matchingEnemy.icon) : undefined;
}

function PullDetailsTitleBlock({
  pull,
  fight,
  details,
}: {
  pull: WCLDungeonPull;
  fight: Fight;
  details?: DungeonPullDetails;
}) {
  const { report } = useReport();

  const iconUrl = useMemo(() => pullIcon(pull, report), [pull, report]);

  const npcCount = useMemo(() => moreNpcsCount(pull, fight, report), [pull, fight, report]);

  return (
    <div className={styles.PullDetailsTitleContainer}>
      <img className={styles.PullDetailsTitleImage} src={iconUrl} />
      <div className={styles.PullDetailsTitleName}>
        {pull.boss > 0 && <SkullIcon />}
        {pull.name} {npcCount > 1 && <small>(+{npcCount} more)</small>}
      </div>
      <div className={styles.PullDetailsTitleSubtext}>
        <Tooltip
          content={
            <>
              {formatDurationMinSec((pull.start_time - fight.start_time) / 1000, false, 0)} &mdash;{' '}
              {formatDurationMinSec((pull.end_time - fight.start_time) / 1000, false, 0)}
            </>
          }
        >
          <span>{formatDurationMinSec((pull.end_time - pull.start_time) / 1000, false, 0)}</span>
        </Tooltip>
        {details && details.countGained > 0 && fight.countRequired && (
          <>
            {' '}
            &middot;
            <Tooltip
              content={
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {pull.enemyNPCs
                    ?.filter((npc) => fight.npcCountMap?.[npc.gameID])
                    .sort(
                      (a, b) =>
                        (fight.npcCountMap?.[b.gameID] ?? 0) - (fight.npcCountMap?.[a.gameID] ?? 0),
                    )
                    .map((npc) => {
                      const num = npc.maximumInstanceID - npc.minimumInstanceID + 1;
                      const countPer = fight.npcCountMap?.[npc.gameID] ?? 0;
                      const name = report.enemies.find((enemy) => enemy.id === npc.id)?.name;

                      return (
                        <li key={npc.id}>
                          {formatPercentage((num * countPer) / fight.countRequired!)}% &mdash; {num}
                          x {name}
                        </li>
                      );
                    })}
                </ul>
              }
            >
              <span> +{formatPercentage(details.countGained / fight.countRequired, 1)}%</span>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}

function moreNpcsCount(pull: WCLDungeonPull, fight: WCLFight, report: Report) {
  return (
    pull.enemyNPCs
      ?.filter((npc) => fight.npcCountMap?.[npc.gameID])
      .map((npc) => {
        const enemy = report.enemies.find((enemy) => enemy.id === npc.id);
        const count = npc.maximumInstanceID - npc.minimumInstanceID;
        if (enemy?.name === pull.name) {
          return count;
        }

        return count + 1;
      })
      .reduce((a, b) => a + b, 0) ?? 0
  );
}

function InsetContainer({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx(styles.InsetContainer, className)}>{children}</div>;
}

function AbilityList({
  abilities,
  activeAbilities,
  label,
}: {
  abilities: number[];
  activeAbilities: number[];
  label: React.ReactNode;
}) {
  return (
    <InsetContainer className={styles.AbilityList}>
      <div>{label}</div>
      {abilities.map((id) => (
        <SpellIcon
          key={id}
          spell={id}
          className={clsx({
            [styles.activeIcon]: activeAbilities.includes(id),
            [styles.desaturatedIcon]: !activeAbilities.includes(id),
          })}
        />
      ))}
    </InsetContainer>
  );
}

export function shouldShowDungeonPullList(
  fight: Fight,
  selectedPull?: SelectedDungeonPull,
): boolean {
  return isMythicPlus(fight) && !selectedPull;
}
