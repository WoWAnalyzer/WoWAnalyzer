import styled from '@emotion/styled';
import isPropValid from '@emotion/is-prop-valid';
import talents from 'common/TALENTS/deathknight';
import ResourceLink from 'interface/ResourceLink';
import SpellLink from 'interface/SpellLink';
import { BadColor, SubSection, useAnalyzer, useEvents, useInfo } from 'interface/guide';
import SuggestionBox from 'interface/suggestion-box/SuggestionBox';
import RunicPowerTracker from '../../runicpower/RunicPowerTracker';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { Highlight } from 'interface/Highlight';
import RuneTracker from '../../core/RuneTracker';
import { ResourceWasteProblemRenderer } from '../../../components/ResourceWasteProblemRenderer';
import Explanation from 'interface/guide/components/Explanation';
import { RuneWaste } from '../../features/RuneWaste';
import DeathStrikeUsageSubSection from './UsageSection';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ProblemList from 'interface/guide/components/ProblemList';
import RuneCooldownBar from '../../../components/RuneCooldownBar';
import Tooltip from 'interface/Tooltip';

export default function DeathStrikeSection() {
  const rp = useAnalyzer(RunicPowerTracker);
  const runes = useAnalyzer(RuneTracker);
  const events = useEvents();
  const info = useInfo();

  if (!rp || !runes || !info) {
    return <>Core analyzers missing.</>;
  }

  return (
    <>
      <p>
        Blood DK is built around <SpellLink spell={talents.DEATH_STRIKE_TALENT} />. It is the core
        of your toolkit, and many of your abilities exist only to fuel it. Blood's core loop is
        simple:
      </p>
      <ol>
        <li>
          Convert <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> into{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> using abilities like{' '}
          <SpellLink spell={talents.HEART_STRIKE_TALENT} />
        </li>
        <li>
          Spend <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> on{' '}
          <SpellLink spell={talents.DEATH_STRIKE_TALENT} />
        </li>
      </ol>
      <p>
        However, playing Blood well means making smart choices about how &amp; when to do both of
        these things.
      </p>
      <p>
        Blood is currently <strong>resource overloaded.</strong> That means that your active play
        revolves around trying to spend as many of your resources as you can without wasting
        them&mdash;and without leaving yourself vulnerable to damage by over-spending.
      </p>
      <SubSection
        title={
          <>
            Generating <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> for{' '}
            <SpellLink spell={talents.DEATH_STRIKE_TALENT} />
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '45% 1fr', gap: '2em' }}>
          <div>
            <p>
              The most important thing about <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> is
              being able to cast it&mdash;which means generating{' '}
              <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id}>RP</ResourceLink> to spend on it.
            </p>
            <RunicPowerTable />
            <p style={{ marginTop: '1em' }}>
              Every rune you spend generates 10 <Highlight color={RuneColor}>Base</Highlight> RP .{' '}
              <SpellLink spell={talents.HEART_STRIKE_TALENT} /> generates 5+{' '}
              <Highlight textColor="#111" color={RunicPowerColor}>
                Bonus
              </Highlight>{' '}
              RP beyond that, which should make it your main{' '}
              <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id}>RP</ResourceLink> generator. You can
              only store 125 RP at once; generating more than that is called <em>overcapping</em>{' '}
              and results in <Highlight color={WastedRPColor}>Wasted</Highlight> RP. You should have
              very little <Highlight color={WastedRPColor}>Wasted</Highlight> RP.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
            <SuggestionBox
              performance={rp.wastePerformance}
              title={
                <>
                  You should have very little <Highlight color={WastedRPColor}>Wasted</Highlight> RP
                </>
              }
              description="Wasting RP costs you damage and healing. Aim for less than 5% waste."
            >
              <ProblemList
                renderer={ResourceWasteProblemRenderer}
                problems={rp.wasteProblems}
                events={events}
                info={info}
              />
            </SuggestionBox>
            <SuggestionBox
              performance={runes.wastedRunePerformance}
              title={
                <>
                  You should generate as much{' '}
                  <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id}>RP</ResourceLink> as possible.
                </>
              }
              description={
                <>
                  RP is generated by spending <ResourceLink id={RESOURCE_TYPES.RUNES.id} />.
                </>
              }
            >
              <Explanation as="p">
                Although you have 6 <ResourceLink id={RESOURCE_TYPES.RUNES.id} />, only 3 can be
                recharging at a time. You should aim to spend as much time as possible with 3 or
                more recharging.
              </Explanation>
              <RuneCooldownBar timeline={runes.runesReady} />
              <p>
                You wasted <strong>{Math.round(runes.runesWasted)}</strong>{' '}
                <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> ( ~
                {formatPercentage(1 - runes.runeEfficiency)}% of {Math.round(runes.runesMaxCasts)}{' '}
                total) by having fewer than 3 Runes recharging.
              </p>
              <Explanation as="p">
                Remember that <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> cannot be spent directly
                on defensives! As long as you are not{' '}
                <Highlight color={WastedRPColor}>wasting</Highlight>{' '}
                <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id}>RP</ResourceLink> or allowing{' '}
                <SpellLink spell={SPELLS.BONE_SHIELD} /> to drop, having few or no available{' '}
                <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> is okay!
              </Explanation>
            </SuggestionBox>
            <RuneWaste />
          </div>
        </div>
      </SubSection>
      <DeathStrikeUsageSubSection />
    </>
  );
}

const RPTableContainer = styled.div`
  display: grid;
  grid-template-columns: max-content max-content 1fr;
  gap: 2px 0.5em;
  align-items: center;
  align-content: start;
`;

const heartStrikeSpells = [
  talents.HEART_STRIKE_TALENT,
  SPELLS.HEARTBREAKER_ENERGIZE,
  SPELLS.BLOOD_STRIKE,
];

const abilityGroups = [
  heartStrikeSpells,
  [talents.MARROWREND_TALENT],
  [SPELLS.DEATH_AND_DECAY, SPELLS.RELISH_IN_BLOOD],
  [talents.SOUL_REAPER_TALENT],
  [SPELLS.DEATHS_CARESS],
];

function RunicPowerTable() {
  const rp = useAnalyzer(RunicPowerTracker);
  const info = useInfo();
  // TODO: add support to RuneTracker for showing where runes went? worth?
  if (!rp) {
    return null;
  }
  const maxRp = abilityGroups
    .map((spells) => {
      return rp.generatedRp(spells) + rp.wastedRp(spells);
    })
    .reduce((a, b) => Math.max(a, b), 0);

  const runeGeneration = abilityGroups
    .map((spells) => rp.generatedRp(spells))
    .reduce((a, b) => a + b, 0);
  const runeWaste = abilityGroups.map((spells) => rp.wastedRp(spells)).reduce((a, b) => a + b, 0);

  const otherRp = rp.generated - runeGeneration;
  const otherWastedRp = rp.wasted - runeWaste;

  return (
    <RPTableContainer>
      {abilityGroups.map((spells) => {
        const displaySpell = spells[0];
        // if the display spell is unknown, skip this
        if (!info?.abilities.find((ability) => ability.primarySpell === displaySpell.id)?.enabled) {
          return null;
        }
        return (
          <RunicPowerTableRow
            key={displaySpell.id}
            label={<SpellLink spell={displaySpell} />}
            maxRp={maxRp}
            runesSpent={rp.estRunesSpent(spells)}
            rpBonus={rp.bonusGeneratedRp(spells)}
            rpWasted={rp.wastedRp(spells)}
            rpAmount={rp.generatedRp(spells)}
          />
        );
      })}
      <RunicPowerTableRow
        label={<>Other</>}
        maxRp={maxRp}
        runesSpent={0}
        rpBonus={otherRp}
        rpWasted={otherWastedRp}
        rpAmount={otherRp}
      />
    </RPTableContainer>
  );
}

// TODO: these color-block bits should be moved out and re-used in the Mitigation analyzer, along with some other bits like the red/green duration bar

/**
 * A basic colored block. The building block of more complex objects. You MUST supply the height/width yourself.
 */
const ColoredBlock = styled('div', {
  shouldForwardProp: (prop) => {
    switch (prop) {
      case 'width':
      case 'height':
      case 'color':
        return false;
      default:
        return isPropValid(prop);
    }
  },
})<{ color: string; height?: string; width: string }>`
  display: inline-block;
  box-sizing: content-box;
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  background-color: ${(props) => props.color};
`;

const BlockRow = styled('div', { shouldForwardProp: isPropValid })`
  display: inline-flex;
  flex-direction: row;
  gap: 1px;
  & > ${ColoredBlock} {
    height: 100%;
  }
  max-height: 1.5em;
  height: 100%;
`;

const RuneColor = 'hsl(0, 0%, 30%)';
const RunicPowerColor = 'hsl(191, 60%, 50%)';
const WastedRPColor = BadColor;

function RunicPowerTableRow({
  label,
  rpAmount,
  rpWasted,
  rpBonus,
  runesSpent,
  maxRp,
}: {
  label: JSX.Element;
  rpAmount: number;
  runesSpent: number;
  rpWasted: number;
  rpBonus: number;
  maxRp: number;
}) {
  const baseRp = rpAmount - rpBonus;
  return (
    <>
      <div>{label}</div>
      <div>{formatNumber(rpAmount + rpWasted)} RP</div>
      <Tooltip
        content={
          <>
            {runesSpent > 0 ? <>Converted {formatNumber(runesSpent)} runes into</> : <>Generated</>}{' '}
            <Highlight color={RuneColor}>{formatNumber(baseRp)} Base</Highlight> RP, plus{' '}
            <Highlight color={RunicPowerColor} textColor="black">
              {formatNumber(Math.max(rpBonus, 0))} Bonus
            </Highlight>{' '}
            RP and <Highlight color={WastedRPColor}>{formatNumber(rpWasted)} Wasted</Highlight> RP (
            {formatPercentage(rpWasted / (rpAmount + rpWasted))}% waste)
          </>
        }
      >
        <BlockRow>
          <ColoredBlock color={RuneColor} width={`${(baseRp / maxRp) * 100}%`} />
          {rpBonus > 0 && (
            <ColoredBlock color={RunicPowerColor} width={`${(rpBonus / maxRp) * 100}%`} />
          )}
          {rpWasted > 0 && (
            <ColoredBlock color={WastedRPColor} width={`${(rpWasted / maxRp) * 100}%`} />
          )}
        </BlockRow>
      </Tooltip>
    </>
  );
}
