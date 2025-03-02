import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { TALENTS_DEATH_KNIGHT } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import DRAGONFLIGHT_OTHERS_SPELLS from 'common/SPELLS/dragonflight/others';
import DRAGONFLIGHT_OTHERS_ITEMS from 'common/ITEMS/dragonflight/others';
import { GuideProps, Section } from 'interface/guide';
import DeathStrikeSection from '../spells/DeathStrike/DeathStrikeSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';

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
      <Section title="Core Skills">
        <FoundationDowntimeSection />
      </Section>
      <Section title="Death Strike">
        <DeathStrikeSection />
        {props.modules.deathStrikeTiming.guideSubsection}
      </Section>
      <Section title="Cooldowns">
        <CooldownGraphSubsection cooldowns={cooldowns} />
      </Section>
      <PreparationSection />
    </>
  );
}
