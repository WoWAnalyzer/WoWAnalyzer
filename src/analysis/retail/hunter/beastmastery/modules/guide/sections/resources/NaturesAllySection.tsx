import CombatLogParser from 'analysis/retail/hunter/beastmastery/CombatLogParser';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS/hunter';
import { SpellLink } from 'interface';
import { ModulesOf, Section, SubSection } from 'interface/guide';
import { ProseListSpell } from 'analysis/retail/hunter/beastmastery/helpers';

export default function NaturesAllySection(modules: ModulesOf<typeof CombatLogParser>) {
  return (
    <Section title="Nature's Ally">
      <p>
        <ProseListSpell spells={modules.naturesAlly.naturesAllySpells} /> each grant the
        <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} /> buff.{' '}
        <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> consumes it for bonus
        damage. Always have the buff active before pressing{' '}
        <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} />.
      </p>
      <p>
        You cast <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} />{' '}
        <strong>{modules.naturesAlly.kcUnbuffedCount}</strong> time
        {modules.naturesAlly.kcUnbuffedCount !== 1 ? 's' : ''} without{' '}
        <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} /> active.
      </p>
      <p>
        You overwrote <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} />{' '}
        <strong>{modules.naturesAlly.builderOverwriteCount}</strong> time
        {modules.naturesAlly.builderOverwriteCount !== 1 ? 's' : ''} before consuming it with{' '}
        <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} />.
      </p>
      <SubSection title="Builder Casts">
        {modules.naturesAlly.guideSubsectionBuilderCasts}
      </SubSection>
      <SubSection title="Kill Command Casts">
        {modules.naturesAlly.guideSubsectionKillCommand}
      </SubSection>
    </Section>
  );
}
