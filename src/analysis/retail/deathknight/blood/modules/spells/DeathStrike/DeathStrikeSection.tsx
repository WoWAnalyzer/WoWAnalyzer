import styled from '@emotion/styled';
import { Trans } from '@lingui/macro';
import { RuneTracker } from 'analysis/retail/deathknight/shared';
import { MitigationSegments } from 'analysis/retail/monk/brewmaster/modules/core/MajorDefensives/core';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink, TooltipElement } from 'interface';
import { BadColor, GoodColor, Section, useAnalyzers } from 'interface/guide';
import CastReasonBreakdownTableContents from 'interface/guide/components/CastReasonBreakdownTableContents';
import Explanation from 'interface/guide/components/Explanation';
import PassFailBar from 'interface/guide/components/PassFailBar';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import RunicPowerTracker from '../../runicpower/RunicPowerTracker';
import BloodShield from '../BloodShield/BloodShield';
import DeathStrike, { BLOOD_SHIELD_THRESHOLD, DeathStrikeReason } from './index';

const reasonLabel = (reason: DeathStrikeReason) => {
  switch (reason) {
    case DeathStrikeReason.GoodHealing:
      return <Trans id="blood.guide.death-strike.good-healing">Large Heal</Trans>;
    case DeathStrikeReason.LowHealth:
      return (
        <Trans id="blood.guide.death-strike.low-hp">
          <SpellLink id={talents.DEATH_STRIKE_TALENT} /> at Low HP
        </Trans>
      );
    case DeathStrikeReason.BloodShield:
      return (
        <TooltipElement
          content={
            <Trans id="blood.guide.death-strike.blood-shield.tooltip">
              Only counts absorbs that mitigate hits for more than{' '}
              <strong>{formatPercentage(BLOOD_SHIELD_THRESHOLD, 0)}%</strong> of your HP.
            </Trans>
          }
        >
          <Trans id="blood.guide.death-strike.blood-shield">
            Generate <SpellLink id={SPELLS.BLOOD_SHIELD} />
          </Trans>
        </TooltipElement>
      );
    case DeathStrikeReason.DumpRP:
      return (
        <Trans id="blood.guide.death-strike.dump-rp">
          Dump <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />
        </Trans>
      );
    case DeathStrikeReason.Other:
      return <Trans id="guide.unknown-reason">Other</Trans>;
  }
};

const Table = styled.table`
  td {
    padding: 0 1em;
  }

  th {
    font-weight: bold;
  }
`;

export function DeathStrikeSection(): JSX.Element {
  const [ds, runes, rp, dtps, bloodShield] = useAnalyzers([
    DeathStrike,
    RuneTracker,
    RunicPowerTracker,
    DamageTaken,
    BloodShield,
  ] as const);

  const runesSpent = runes.runesMaxCasts - runes.runesWasted;

  const healedDamage = ds.totalHealing + bloodShield.totalHealing;
  const totalDamage = dtps.total.effective;
  const healingTarget = totalDamage / 2;

  return (
    <Section title="Death Strike Usage">
      <Explanation>
        <p>
          As a Blood Death Knight, <SpellLink id={talents.DEATH_STRIKE_TALENT} /> is both your main
          defensive tool and one of your strongest damaging abilities. Balancing these two uses is
          important to playing the spec well.
        </p>
        <p>
          There are three main ways that you can use <SpellLink id={talents.DEATH_STRIKE_TALENT} />{' '}
          defensively:
          <ul>
            <li>
              You can use it while at <strong>low health</strong> to help recover, or
            </li>
            <li>
              You can use it{' '}
              <TooltipElement
                content={
                  <>
                    <SpellLink id={talents.DEATH_STRIKE_TALENT} />
                    's healing is based on the total amount of damage you took in the previous 5
                    seconds. This allows you to get a lot of healing from it, even if your HP never
                    gets very low.
                  </>
                }
              >
                after taking lots of damage
              </TooltipElement>{' '}
              for a <strong>large heal</strong>, or
            </li>
            <li>
              You can use it to generate a{' '}
              <strong>
                <SpellLink id={SPELLS.BLOOD_SHIELD} />
              </strong>{' '}
              absorb <em>before</em> a large Physical hit to help you survive it.
            </li>
          </ul>
        </p>
        <p>
          However, Blood currently has <em>too much</em>{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> for you to spend only on defensive
          casts. If you try to only use <SpellLink id={talents.DEATH_STRIKE_TALENT} /> defensively,
          you will waste most of the RP that you generate. To avoid this, weave casts of{' '}
          <SpellLink id={talents.DEATH_STRIKE_TALENT} /> between your casts of{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> generators like{' '}
          <SpellLink id={talents.HEART_STRIKE_TALENT} /> to keep the extra from going to waste. This
          is called <strong>dumping</strong> <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />.
        </p>
      </Explanation>
      <Table>
        <thead></thead>
        <tbody>
          <tr>
            <td>Healing Done</td>
            <td>
              {formatNumber(healedDamage)} /{' '}
              <TooltipElement
                content={
                  <>
                    You took <strong>{formatNumber(totalDamage)}</strong> total damage. The value
                    shown here is a reasonable goal (~50% of damage taken) for how much you can heal
                    back via <SpellLink id={talents.DEATH_STRIKE_TALENT} /> and{' '}
                    <SpellLink id={SPELLS.BLOOD_SHIELD} />
                  </>
                }
              >
                {formatNumber(healingTarget)}
              </TooltipElement>
            </td>
            <td>
              <MitigationSegments
                style={{ width: 'calc(100% + 2px)' }}
                rounded
                maxValue={Math.max(healingTarget, healedDamage)}
                segments={[
                  {
                    amount: ds.totalHealing,
                    color: GoodColor,
                    tooltip: (
                      <>
                        Healing by <SpellLink id={talents.DEATH_STRIKE_TALENT} />
                      </>
                    ),
                  },
                  {
                    amount: bloodShield.totalHealing,
                    color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
                    tooltip: (
                      <>
                        Physical damage absorbed by <SpellLink id={SPELLS.BLOOD_SHIELD} />
                      </>
                    ),
                  },
                  {
                    amount: Math.max(healingTarget - healedDamage, 0),
                    color: BadColor,
                    tooltip: <>Damage that required other healing.</>,
                  },
                ]}
              />
            </td>
          </tr>
        </tbody>
        <thead>
          <tr>
            <th colSpan={3}>Resource Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <TooltipElement
                content={
                  <>
                    <p>
                      While <SpellLink id={talents.DEATH_STRIKE_TALENT} /> does not cost{' '}
                      <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> itself, every Rune spent
                      generates 10 or more <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />.
                    </p>
                    <p>
                      You can roughly convert every 4 unspent{' '}
                      <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> into 1 lost{' '}
                      <SpellLink id={talents.DEATH_STRIKE_TALENT} />.
                    </p>
                  </>
                }
              >
                Runes Spent
              </TooltipElement>
            </td>
            <td>
              {runesSpent.toFixed(0)} / {runes.runesMaxCasts}
            </td>
            <td>
              <PassFailBar total={runes.runesMaxCasts} pass={runesSpent} />
            </td>
          </tr>
          <tr>
            <td>Runic Power Spent</td>
            <td>
              {rp.spent} / {rp.spent + rp.wasted}
            </td>
            <td>
              <PassFailBar total={rp.spent + rp.wasted} pass={rp.spent} />
            </td>
          </tr>
        </tbody>
        <thead>
          <tr>
            <th colSpan={3}>Types of Death Strikes</th>
          </tr>
        </thead>
        <CastReasonBreakdownTableContents
          badReason={DeathStrikeReason.Other}
          possibleReasons={[
            DeathStrikeReason.LowHealth,
            DeathStrikeReason.GoodHealing,
            DeathStrikeReason.BloodShield,
            DeathStrikeReason.DumpRP,
            DeathStrikeReason.Other,
          ]}
          label={reasonLabel}
          casts={ds?.casts ?? []}
        />
      </Table>
    </Section>
  );
}
