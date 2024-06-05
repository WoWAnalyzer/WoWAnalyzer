import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { TALENTS_DEATH_KNIGHT } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../../CombatLogParser';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import DRAGONFLIGHT_OTHERS_SPELLS from 'common/SPELLS/dragonflight/others';
import DRAGONFLIGHT_OTHERS_ITEMS from 'common/ITEMS/dragonflight/others';
import { GuideProps, Section, SubSection, useInfo } from 'interface/guide';
import DeathStrikeSection from '../spells/DeathStrike/DeathStrikeSection';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as apl from '../features/AplCheck';
import Explanation from 'interface/guide/components/Explanation';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import ResourceLink from 'interface/ResourceLink';
import AlertWarning from 'interface/AlertWarning';

export default function BloodGuide(props: GuideProps<typeof CombatLogParser>): JSX.Element {
  const cooldowns: Cooldown[] = [
    {
      spell: TALENTS_DEATH_KNIGHT.DANCING_RUNE_WEAPON_TALENT,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.DANCING_RUNE_WEAPON_TALENT),
    },
    {
      spell: TALENTS_DEATH_KNIGHT.TOMBSTONE_TALENT,
      isActive: (c) => c.hasTalent(TALENTS_DEATH_KNIGHT.TOMBSTONE_TALENT),
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
  ];

  return (
    <>
      <Section title="Death Strike">
        <DeathStrikeSection />
        {props.modules.deathStrikeTiming.guideSubsection}
      </Section>
      <Section title="Rotation">
        <AplDescription />
        <SubSection>
          <AplSectionData checker={apl.check} apl={apl.apl} summary={apl.AplSummary} />
        </SubSection>
      </Section>
      <Section title="Cooldowns">
        <CooldownGraphSubsection cooldowns={cooldowns} />
      </Section>
      <PreparationSection />
    </>
  );
}

function AplDescription() {
  const info = useInfo();
  const hasTalent = info?.combatant.hasTalent.bind(info?.combatant);

  const rotationWarnings = hasTalent ? (
    <>
      {hasTalent(TALENTS_DEATH_KNIGHT.INSATIABLE_BLADE_TALENT) &&
      hasTalent(TALENTS_DEATH_KNIGHT.TOMBSTONE_TALENT) ? null : (
        <AlertWarning>
          Using <SpellLink spell={TALENTS_DEATH_KNIGHT.INSATIABLE_BLADE_TALENT} /> and{' '}
          <SpellLink spell={TALENTS_DEATH_KNIGHT.TOMBSTONE_TALENT} /> is strongly recommended
          because it dramatically increases the amount of time that you spend with{' '}
          <SpellLink spell={TALENTS_DEATH_KNIGHT.DANCING_RUNE_WEAPON_TALENT} /> active, improving
          both defensiveness and damage done.
        </AlertWarning>
      )}
      {hasTalent(TALENTS_DEATH_KNIGHT.DEATHS_ECHO_TALENT) &&
      hasTalent(TALENTS_DEATH_KNIGHT.SANGUINE_GROUND_TALENT) &&
      hasTalent(TALENTS_DEATH_KNIGHT.SHATTERING_BONE_TALENT) ? null : (
        <AlertWarning>
          Using <SpellLink spell={TALENTS_DEATH_KNIGHT.SANGUINE_GROUND_TALENT} />,{' '}
          <SpellLink spell={TALENTS_DEATH_KNIGHT.DEATHS_ECHO_TALENT} /> and{' '}
          <SpellLink spell={TALENTS_DEATH_KNIGHT.SHATTERING_BONE_TALENT} /> is recommended because
          it provides a very large increase to your overall damage, improving threat generation
          (especially in AoE settings like Mythic+).
        </AlertWarning>
      )}
    </>
  ) : null;

  return (
    <>
      {rotationWarnings}
      <Explanation>
        <p>
          The Blood DK rotation is built around three overlapping loops:
          <ol>
            <li>
              Spending as many of your <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> /{' '}
              <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> /{' '}
              <SpellLink spell={TALENTS_DEATH_KNIGHT.BLOOD_BOIL_TALENT} /> charges as possible
              without wasting any, and
            </li>
            <li>
              Using <SpellLink spell={TALENTS_DEATH_KNIGHT.INSATIABLE_BLADE_TALENT} /> +{' '}
              <SpellLink spell={TALENTS_DEATH_KNIGHT.TOMBSTONE_TALENT} /> to use{' '}
              <SpellLink spell={TALENTS_DEATH_KNIGHT.DANCING_RUNE_WEAPON_TALENT} /> as often as
              possible, and
            </li>
            <li>
              Getting as much use out of <SpellLink spell={SPELLS.DEATH_AND_DECAY} />
              -related talents like{' '}
              <SpellLink spell={TALENTS_DEATH_KNIGHT.SANGUINE_GROUND_TALENT} /> and{' '}
              <SpellLink spell={TALENTS_DEATH_KNIGHT.SHATTERING_BONE_TALENT} /> as possible
            </li>
          </ol>
        </p>
        <p>
          This is not as complicated as it might sound. Mostly, it means:{' '}
          <strong>
            try to always stand in <SpellLink spell={SPELLS.DEATH_AND_DECAY}>D&amp;D</SpellLink>
          </strong>{' '}
          and <strong>use as many abilities as possible</strong>. Most of the nuance comes from
          trying to balance spending <ResourceLink id={RESOURCE_TYPES.RUNES.id} />,{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> and{' '}
          <SpellLink spell={TALENTS_DEATH_KNIGHT.BLOOD_BOIL_TALENT} />.
        </p>
        <p>
          If you're having a hard time, remember that{' '}
          <SpellLink spell={TALENTS_DEATH_KNIGHT.BLOOD_BOIL_TALENT} /> is almost pure damage, while{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> and{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> power your defensive abilities. It is
          okay to use <SpellLink spell={TALENTS_DEATH_KNIGHT.BLOOD_BOIL_TALENT} /> on pull for
          threat and then forget about it while learning the spec, and then add it in as you get
          better.
        </p>
      </Explanation>
    </>
  );
}
