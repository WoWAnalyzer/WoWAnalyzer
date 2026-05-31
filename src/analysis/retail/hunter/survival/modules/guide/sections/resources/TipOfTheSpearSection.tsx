import CombatLogParser from 'analysis/retail/hunter/survival/CombatLogParser';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import { ModulesOf, Section, SubSection } from 'interface/guide';

export default function TipOfTheSpearSection(modules: ModulesOf<typeof CombatLogParser>) {
  return (
    <Section title="Tip of the Spear">
      <p>
        <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> <strong>builds</strong>{' '}
        <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} /> stacks. These stacks are consumed one
        per cast of your direct-damage abilities. Avoid wasting stacks by timing your Kill Commands
        carefully, and always cast tippable abilities with at least one stack active. The aim for
        survival is to spend before you generate which means even though you have the room for focus
        and tip at 1 stack, you should still spend it prior to generating more.
      </p>
      <p>
        You wasted <strong>{modules.tipOfTheSpear.wastedStacks}</strong> stack
        {modules.tipOfTheSpear.wastedStacks !== 1 ? 's' : ''} of{' '}
        <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} />.
      </p>
      <p>
        <strong>
          Tip of the Spear does not buff the periodic damage of abilities like{' '}
          <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> or{' '}
          <SpellLink spell={TALENTS.FLAMEFANG_PITCH_TALENT} />.
        </strong>
      </p>
      <SubSection title="Kill Command — Stack Generation">
        {modules.tipOfTheSpear.guideSubsectionKillCommand}
      </SubSection>
      <SubSection title="Abilities Cast Without Tip of the Spear">
        {modules.tipOfTheSpear.guideSubsectionUntipped}
      </SubSection>
    </Section>
  );
}
