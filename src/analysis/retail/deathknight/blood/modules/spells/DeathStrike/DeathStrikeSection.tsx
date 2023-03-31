import styled from '@emotion/styled';
import { RuneTracker } from 'analysis/retail/deathknight/shared';
import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink, TooltipElement } from 'interface';
import { Section, useAnalyzers } from 'interface/guide';
import CastReasonBreakdownTableContents from 'interface/guide/components/CastReasonBreakdownTableContents';
import Explanation from 'interface/guide/components/Explanation';
import PassFailBar from 'interface/guide/components/PassFailBar';
import RunicPowerTracker from '../../runicpower/RunicPowerTracker';
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
  const [ds, runes, rp] = useAnalyzers([DeathStrike, RuneTracker, RunicPowerTracker] as const);

  const runesSpent = runes.runesMaxCasts - runes.runesWasted;

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
