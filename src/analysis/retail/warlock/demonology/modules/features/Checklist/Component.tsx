import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
  DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const DemonologyWarlockChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const DotUptime = (props: DotUptimeProps) => (
    <Requirement
      name={
        <>
          <SpellLink spell={props.spell} icon /> uptime
        </>
      }
      thresholds={props.thresholds}
    />
  );

  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use your core spells"
        description={
          <>
            Demonology has a lot of short cooldowns that make up majority of your rotation, such as{' '}
            <SpellLink spell={SPELLS.CALL_DREADSTALKERS} /> or Felguard's{' '}
            <SpellLink spell={SPELLS.FELSTORM_BUFF} />. Try to use them as much as possible.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.CALL_DREADSTALKERS.id} />
        <Requirement
          name={<SpellLink spell={SPELLS.FELSTORM_BUFF} />}
          thresholds={thresholds.felstorm}
        />
        {combatant.hasTalent(TALENTS.BILESCOURGE_BOMBERS_TALENT) && (
          <AbilityRequirement spell={TALENTS.BILESCOURGE_BOMBERS_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.POWER_SIPHON_TALENT) && (
          <AbilityRequirement spell={TALENTS.POWER_SIPHON_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.DOOM_TALENT) && (
          <DotUptime spell={TALENTS.DOOM_TALENT} thresholds={thresholds.doom} />
        )}
        {combatant.hasTalent(TALENTS.SOUL_STRIKE_TALENT) && (
          <AbilityRequirement spell={TALENTS.SOUL_STRIKE_TALENT.id} />
        )}
      </Rule>
      <Rule name="Don't cap your Soul Shards" description="Avoid overcapping Soul Shards.">
        <Requirement name="Wasted shards per minute" thresholds={thresholds.soulShards} />
      </Rule>
      <Rule
        name="Use your cooldowns"
        description="Be mindful of your cooldowns if you are specced into them and use them when it's appropriate. It's okay to hold a cooldown for a little bit when the encounter requires it (burn phases), but generally speaking you should use them as much as you can."
      >
        <AbilityRequirement spell={SPELLS.SUMMON_DEMONIC_TYRANT.id} />
        {combatant.hasTalent(TALENTS.DEMONIC_STRENGTH_TALENT) && (
          <AbilityRequirement spell={TALENTS.DEMONIC_STRENGTH_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SUMMON_VILEFIEND_TALENT) && (
          <AbilityRequirement spell={TALENTS.SUMMON_VILEFIEND_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.GRIMOIRE_FELGUARD_TALENT) && (
          <AbilityRequirement spell={TALENTS.GRIMOIRE_FELGUARD_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Use your utility and defensive spells"
        description={
          <>
            Use other spells in your toolkit to your advantage. For example, you can try to minimize
            necessary movement by using <SpellLink spell={SPELLS.DEMONIC_GATEWAY_CAST} icon />,{' '}
            <SpellLink spell={SPELLS.DEMONIC_CIRCLE} icon />,{' '}
            <SpellLink spell={TALENTS.BURNING_RUSH_TALENT} icon /> or mitigate incoming damage with{' '}
            <SpellLink spell={SPELLS.UNENDING_RESOLVE} icon />/
            <SpellLink spell={TALENTS.DARK_PACT_TALENT} icon />.<br />
            While you shouldn't cast these defensives on cooldown, be aware of them and use them
            whenever effective. Not using them at all indicates you might not be aware of them or
            not using them optimally.
          </>
        }
      >
        {combatant.hasTalent(TALENTS.DARK_PACT_TALENT) && (
          <AbilityRequirement spell={TALENTS.DARK_PACT_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.UNENDING_RESOLVE.id} />
      </Rule>
      <Rule
        name="Always be casting"
        description={
          <>
            You should try to avoid doing nothing during the fight. When you're waiting for
            cooldowns, keep building Soul Shards to summon additional Wild Imps. When you have to
            move, use your instant abilities like <SpellLink spell={SPELLS.DEMONBOLT} /> (with
            Demonic Core) or <SpellLink spell={TALENTS.SOUL_STRIKE_TALENT} /> or try to utilize{' '}
            <SpellLink spell={SPELLS.DEMONIC_CIRCLE} icon>
              Teleport
            </SpellLink>{' '}
            or{' '}
            <SpellLink spell={SPELLS.DEMONIC_GATEWAY_CAST} icon>
              Gateway
            </SpellLink>{' '}
            to reduce the movement even further.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default DemonologyWarlockChecklist;
