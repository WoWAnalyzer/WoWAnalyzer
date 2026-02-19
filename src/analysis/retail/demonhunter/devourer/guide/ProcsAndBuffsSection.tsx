import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../CombatLogParser';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';

function ProcsAndBuffsSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return info.combatant.hasTalent(TALENTS_DEMON_HUNTER.HUNGERING_SLASH_TALENT) ? (
    <Section title="Procs">{modules.voidstep.guideSubsection()}</Section>
  ) : (
    <></>
  );
}

export default ProcsAndBuffsSection;
