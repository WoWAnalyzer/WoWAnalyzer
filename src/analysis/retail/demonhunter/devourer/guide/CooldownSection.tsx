import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../CombatLogParser';

function CooldownSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return <Section title="Cooldowns">{modules.voidMetamorphosis.guideSubsection()}</Section>;
}

export default CooldownSection;
