import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';
import { DeathStrikeSection } from '../spells/DeathStrike/DeathStrikeSection';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { TALENTS_DEATH_KNIGHT } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import DRAGONFLIGHT_OTHERS_ITEMS from 'common/ITEMS/dragonflight/others';
import DRAGONFLIGHT_OTHERS_SPELLS from 'common/SPELLS/dragonflight/others';

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
