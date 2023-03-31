import styled from '@emotion/styled';
import { RuneTracker } from 'analysis/retail/deathknight/shared';
import { MitigationSegments } from 'analysis/retail/monk/brewmaster/modules/core/MajorDefensives/core';
import { formatNumber } from 'common/format';
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
import DeathStrike, { DeathStrikeReason } from './index';

const reasonLabel = (reason: DeathStrikeReason) => {
  switch (reason) {
    case DeathStrikeReason.GoodHealing:
      return 'Large Heal';
    case DeathStrikeReason.LowHealth:
      return 'Low HP';
    case DeathStrikeReason.BloodShield:
      return 'Blood Shield EHP';
    case DeathStrikeReason.DumpRP:
      return 'Dump RP';
    case DeathStrikeReason.Other:
      return 'Other';
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
        <SpellLink id={talents.DEATH_STRIKE_TALENT} /> is the centerpiece of Blood's
        toolkit&mdash;both offensively and defensively.
      </Explanation>
      <Table>
        <thead></thead>
        <tbody>
          <tr>
            <td>Healing Done</td>
            <td>
              {formatNumber(healedDamage)} / {formatNumber(totalDamage)}
            </td>
            <td>
              <MitigationSegments
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
            DeathStrikeReason.GoodHealing,
            DeathStrikeReason.LowHealth,
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
