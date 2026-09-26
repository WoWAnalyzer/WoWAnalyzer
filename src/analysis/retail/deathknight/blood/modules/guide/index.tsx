import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { TALENTS_DEATH_KNIGHT } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import { GuideProps, Section, SubSection } from 'interface/guide';
import SpellLink from 'interface/SpellLink';
import { OSSUARY_STACKS } from '../features/BoneShieldGraph';
import { ESSENCE_MAX_STACKS } from '../talents/EssenceOfTheBloodQueen';
import DeathStrikeSection from '../spells/DeathStrike/DeathStrikeSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';

export default function BloodGuide(props: GuideProps<typeof CombatLogParser>): JSX.Element {
  const cooldowns: Cooldown[] = [
    {
      spell: TALENTS_DEATH_KNIGHT.DANCING_RUNE_WEAPON_TALENT,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.DANCING_RUNE_WEAPON_TALENT),
    },
  ];

  const { modules, info } = props;
  const hasSanlayn = info.combatant.hasTalent(TALENTS_DEATH_KNIGHT.VAMPIRIC_STRIKE_TALENT);

  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
      </Section>
      <Section title="Death Strike">
        <DeathStrikeSection />
        {props.modules.deathStrikeTiming.guideSubsection}
      </Section>
      <Section title="Bone Shield">
        <SubSection title="Bone Shield Stacks">
          <p>
            <SpellLink spell={SPELLS.BONE_SHIELD} /> is the core of your damage reduction and
            resource generation - keep it stacked up and don't let it fall off. Aim to stay at{' '}
            {OSSUARY_STACKS} or more stacks so{' '}
            <SpellLink spell={TALENTS_DEATH_KNIGHT.OSSUARY_TALENT} /> stays active; the dashed line
            marks that threshold.
          </p>
          <p>
            Each dot is a <SpellLink spell={TALENTS_DEATH_KNIGHT.MARROWREND_TALENT} /> cast. Green
            dots gained all 3 stacks, red dots overcapped and wasted stacks - avoid those by waiting
            until you are at 7 stacks or fewer.
          </p>
          {modules.boneShieldGraph.plot}
        </SubSection>
      </Section>
      {hasSanlayn && (
        <Section title="San'layn">
          <SubSection title="Essence of the Blood Queen">
            <p>
              <SpellLink spell={SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF} /> grants haste per stack,
              stacking up to a maximum of {ESSENCE_MAX_STACKS}. You should aim to keep this buff at{' '}
              {ESSENCE_MAX_STACKS} stacks as much as possible by regularly using{' '}
              <SpellLink spell={TALENTS_DEATH_KNIGHT.VAMPIRIC_STRIKE_TALENT} />.
            </p>
            <p>
              You spent{' '}
              <strong>{formatPercentage(modules.EssenceOfTheBloodQueen.maxStackUptime)}%</strong> of
              the encounter at the maximum of {ESSENCE_MAX_STACKS} stacks, and{' '}
              <strong>{formatPercentage(modules.EssenceOfTheBloodQueen.uptime)}%</strong> of the
              encounter with the buff active.
            </p>
            {modules.essenceOfTheBloodQueenGraph.plot}
          </SubSection>
        </Section>
      )}
      <Section title="Cooldowns">
        <CooldownGraphSubsection cooldowns={cooldowns} />
      </Section>
      <PreparationSection />
    </>
  );
}
