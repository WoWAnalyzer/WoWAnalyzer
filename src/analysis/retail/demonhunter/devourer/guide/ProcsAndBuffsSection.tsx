import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../CombatLogParser';

function ProcsAndBuffsSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return <Section title="Procs">{modules.voidstep.guideSubsection()}</Section>;
}

export default ProcsAndBuffsSection;
