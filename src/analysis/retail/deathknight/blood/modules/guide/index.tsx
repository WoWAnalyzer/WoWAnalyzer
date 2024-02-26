import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { TALENTS_DEATH_KNIGHT } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink, Tooltip } from 'interface';
import { BadColor, GuideProps, Section, SubSection, useAnalyzer } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';
import Spell from 'common/SPELLS/Spell';
import styled from '@emotion/styled';
import { formatNumber, formatPercentage } from 'common/format';
import RunicPowerTracker from '../runicpower/RunicPowerTracker';
import isPropValid from '@emotion/is-prop-valid';
import { Highlight } from 'interface/Highlight';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import DRAGONFLIGHT_OTHERS_SPELLS from 'common/SPELLS/dragonflight/others';
import DRAGONFLIGHT_OTHERS_ITEMS from 'common/ITEMS/dragonflight/others';

export default function BloodGuide(props: GuideProps<typeof CombatLogParser>): JSX.Element {
  const cooldowns: Cooldown[] = [
    {
      spell: TALENTS_DEATH_KNIGHT.DANCING_RUNE_WEAPON_TALENT,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.DANCING_RUNE_WEAPON_TALENT),
    },
    {
      spell: SPELLS.EMPOWER_RUNE_WEAPON,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.EMPOWER_RUNE_WEAPON_SHARED_TALENT),
    },
    {
      spell: DRAGONFLIGHT_OTHERS_SPELLS.RAGE_OF_FYRALATH_1,
      isActive: (c) => c.hasMainHand(DRAGONFLIGHT_OTHERS_ITEMS.FYRALATH.id),
    },
    {
      spell: TALENTS_DEATH_KNIGHT.ABOMINATION_LIMB_TALENT,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.ABOMINATION_LIMB_TALENT),
    },
    {
      spell: TALENTS_DEATH_KNIGHT.ICEBOUND_FORTITUDE_TALENT,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.ICEBOUND_FORTITUDE_TALENT),
    },
    {
      spell: TALENTS_DEATH_KNIGHT.VAMPIRIC_BLOOD_TALENT,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.VAMPIRIC_BLOOD_TALENT),
    },
    {
      spell: TALENTS_DEATH_KNIGHT.ANTI_MAGIC_SHELL_TALENT,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.ANTI_MAGIC_SHELL_TALENT),
    },
  ];
  return (
    <>
      <Section title="Death Strike">
        <DeathStrikeSection />
        {props.modules.deathStrikeTiming.guideSubsection}
      </Section>
      <Section title="Runic Power Economy">
        {props.modules.runicPowerDetails.guideSubsection}
      </Section>
      <Section title="Cooldowns">
        <CooldownGraphSubsection cooldowns={cooldowns} />
      </Section>
      <PreparationSection />
    </>
  );
}

function DeathStrikeSection() {
  return (
    <Section title={<SpellLink spell={talents.DEATH_STRIKE_TALENT} />}>
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
        <p>
          The obvious place to start looking at <SpellLink spell={talents.DEATH_STRIKE_TALENT} />{' '}
          would be with <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> itself, but that isn't
          quite correct. We need to start <em>earlier</em>&mdash;with generating the{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id}>RP</ResourceLink> needed to use it.
        </p>
        <p>
          Every rune you spend generates 10 <Highlight color={RuneColor}>Base</Highlight> RP .{' '}
          <SpellLink spell={talents.HEART_STRIKE_TALENT} /> generates 5+{' '}
          <Highlight textColor="#111" color={RunicPowerColor}>
            Bonus
          </Highlight>{' '}
          RP beyond that, which should make it your main{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id}>RP</ResourceLink> generator. You can only
          store 125 RP at once; generating more than that is called <em>overcapping</em> and results
          in <Highlight color={WastedRPColor}>Wasted</Highlight> RP. You should have very little{' '}
          <Highlight color={WastedRPColor}>Wasted</Highlight> RP.
        </p>
        <div style={{ width: '50%' }}>
          <RunicPowerTable />
        </div>
        <ul>
          <li>TEMP NOTES (NOT IN ORDER)</li>
          <li>
            Use <SpellLink spell={talents.HEART_STRIKE_TALENT} /> by default because it generates
            50% more RP per Rune.
          </li>
          <li>
            Only use <SpellLink spell={talents.MARROWREND_TALENT} /> to maintain{' '}
            <SpellLink spell={SPELLS.BONE_SHIELD} /> / <SpellLink spell={talents.OSSUARY_TALENT} />
          </li>
          <li>
            Maintain <SpellLink spell={SPELLS.DEATH_AND_DECAY} /> for its many (many) buffs
          </li>
          <li>
            Keep 3 <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> recharging as much as possible
          </li>
          <li>
            Avoid over-capping <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />, using{' '}
            <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> to spend extra before generating more
          </li>
          <li>/TEMP</li>
        </ul>
      </SubSection>
      <SubSection title="Resource Starvation">
        <p>
          <strong>Resource Starvation</strong> is what happens when you spend <em>all</em> of your
          resources and don't have any left to use on{' '}
          <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> when you need it.{' '}
          <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> is so core to our survival that being
          unable to use it can very easily get you killed.
        </p>
        <p>
          Blood is one of the few specs remaining where{' '}
          <strong>sometimes doing nothing is correct</strong>, but with the current class tuning it
          is uncommon.
        </p>
      </SubSection>
      <SubSection
        title={
          <>
            <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> Usage
          </>
        }
      >
        <p>
          After making sure that you're generating enough resources for{' '}
          <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> and making sure that you're not starving
          yourself at key times, you can finally begin to think about how good your{' '}
          <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> usage actually is.
        </p>
        <p>
          The truth is that you're going to cast <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> a{' '}
          <em>lot</em>. It will likely be your second most common ability (after{' '}
          <SpellLink spell={talents.HEART_STRIKE_TALENT} />) when playing well. Don&apos;t fixate on
          making every <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> perfect&mdash;but it is
          worth making sure to avoid <em>bad</em> uses.
        </p>
      </SubSection>
    </Section>
  );
}

const RPTableContainer = styled.div`
  display: grid;
  grid-template-columns: max-content max-content 1fr;
  gap: 2px 0.5em;
  align-items: center;
`;

function RunicPowerTable() {
  const rp = useAnalyzer(RunicPowerTracker);
  // TODO: add support to RuneTracker for showing where runes went? worth?
  if (!rp) {
    return null;
  }
  const abilities = [
    [talents.HEART_STRIKE_TALENT, SPELLS.HEARTBREAKER_ENERGIZE],
    [talents.MARROWREND_TALENT],
    [SPELLS.DEATH_AND_DECAY],
    [talents.DEATHS_CARESS_TALENT],
  ];
  const maxRp = abilities
    .map((spells) => {
      return spells
        .map((spell) => {
          const data = rp.buildersObj[spell.id];
          if (!data) {
            return 0;
          }

          return data.generated + data.wasted;
        })
        .reduce((a, b) => a + b, 0);
    })
    .reduce((a, b) => Math.max(a, b), 0);
  return (
    <RPTableContainer>
      {abilities.map((spells) => {
        const displaySpell = spells[0];
        const rpGenerated = spells
          .map((spell) => rp.buildersObj[spell.id]?.generated ?? 0)
          .reduce((a, b) => a + b, 0);
        const rpWasted = spells
          .map((spell) => rp.buildersObj[spell.id]?.wasted ?? 0)
          .reduce((a, b) => a + b, 0);
        const casts = rp.buildersObj[displaySpell.id]?.casts ?? 0;
        console.log(displaySpell, rpGenerated, rpWasted, casts);
        return (
          <RunicPowerTableRow
            key={displaySpell.id}
            spell={displaySpell}
            runeCount={(displaySpell.id === talents.MARROWREND_TALENT.id ? 2 : 1) * casts}
            maxRp={maxRp}
            rpWasted={rpWasted}
            rpAmount={rpGenerated}
          />
        );
      })}
    </RPTableContainer>
  );
}

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
})<{ color: string; height: string; width: string }>`
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
`;

const RuneColor = 'hsl(0, 0%, 30%)';
const RunicPowerColor = 'hsl(191, 60%, 50%)';
// we don't use the normal BadColor because of bad contrast with the lightness of RPColor
const WastedRPColor = BadColor;

function RunicPowerTableRow({
  spell,
  rpAmount,
  runeCount,
  rpWasted,
  maxRp,
}: {
  spell: Spell;
  runeCount: number;
  rpAmount: number;
  rpWasted: number;
  maxRp: number;
}) {
  const baseRp = runeCount * 10;
  const bonusRp = rpAmount - baseRp;
  return (
    <>
      <div>
        <SpellLink spell={spell} />
      </div>
      <div>{formatNumber(rpAmount + rpWasted)} RP</div>
      <Tooltip
        content={
          <>
            Converted {formatNumber(runeCount)} runes into{' '}
            <Highlight color={RuneColor}>{formatNumber(baseRp)} Base</Highlight> RP, plus{' '}
            <Highlight color={RunicPowerColor} textColor="black">
              {formatNumber(Math.max(bonusRp, 0))} Bonus
            </Highlight>{' '}
            RP and <Highlight color={WastedRPColor}>{formatNumber(rpWasted)} Wasted</Highlight> RP (
            {formatPercentage(rpWasted / (rpAmount + rpWasted))}% waste)
          </>
        }
      >
        <BlockRow style={{ height: '100%' }}>
          <ColoredBlock color={RuneColor} width={`${(baseRp / maxRp) * 100}%`} height="100%" />
          {bonusRp > 0 && (
            <ColoredBlock
              color={RunicPowerColor}
              height="100%"
              width={`${(bonusRp / maxRp) * 100}%`}
            />
          )}
          {rpWasted > 0 && (
            <ColoredBlock
              color={WastedRPColor}
              height="100%"
              width={`${(rpWasted / maxRp) * 100}%`}
            />
          )}
        </BlockRow>
      </Tooltip>
    </>
  );
}
