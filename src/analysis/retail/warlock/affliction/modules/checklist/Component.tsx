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

const AfflictionWarlockChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
        name="Maintain your DoTs and debuffs on the boss"
        description="Affliction Warlocks rely heavily on DoTs in order to deal damage to the target. You should try and have as high of an uptime as possible."
      >
        <DotUptime spell={SPELLS.AGONY} thresholds={thresholds.agony} />
        <DotUptime spell={SPELLS.CORRUPTION_CAST} thresholds={thresholds.corruption} />
        <DotUptime spell={SPELLS.UNSTABLE_AFFLICTION} thresholds={thresholds.unstableAffliction} />
        {combatant.hasTalent(TALENTS.SHADOW_EMBRACE_TALENT) && (
          <DotUptime spell={TALENTS.SHADOW_EMBRACE_TALENT} thresholds={thresholds.shadowEmbrace} />
        )}
        <DotUptime spell={TALENTS.SHADOW_EMBRACE_TALENT} thresholds={thresholds.shadowEmbrace} />
        {combatant.hasTalent(TALENTS.SIPHON_LIFE_TALENT) && (
          <DotUptime spell={TALENTS.SIPHON_LIFE_TALENT} thresholds={thresholds.siphonLife} />
        )}
        {combatant.hasTalent(TALENTS.HAUNT_TALENT) && (
          <DotUptime spell={TALENTS.HAUNT_TALENT} thresholds={thresholds.haunt} />
        )}
      </Rule>
      <Rule
        name="Don't cap your Soul Shards"
        description="Soul Shards are your main and most important resource and since their generation is random as Affliction, it's very important not to let them cap."
      >
        <Requirement name="Wasted shards per minute" thresholds={thresholds.soulShardDetails} />
      </Rule>
      <Rule
        name="Use your cooldowns"
        description="Be mindful of your cooldowns if you are specced into them and use them when it's appropriate. It's okay to hold a cooldown for a little bit when the encounter requires it (burn phases), but generally speaking you should use them as much as you can."
      >
        {combatant.hasTalent(TALENTS.SUMMON_DARKGLARE_TALENT) && (
          <AbilityRequirement spell={SPELLS.SUMMON_DARKGLARE.id} />
        )}
        {combatant.hasTalent(TALENTS.VILE_TAINT_TALENT) && (
          <AbilityRequirement spell={TALENTS.VILE_TAINT_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.PHANTOM_SINGULARITY_TALENT) && (
          <AbilityRequirement spell={TALENTS.PHANTOM_SINGULARITY_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SOUL_ROT_TALENT) && (
          <AbilityRequirement spell={TALENTS.SOUL_ROT_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Use your utility and defensive spells"
        description={
          <>
            Use other spells in your toolkit to your advantage. For example, you can try to minimize
            necessary movement by using <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon />,{' '}
            <SpellLink id={SPELLS.DEMONIC_CIRCLE.id} icon />,{' '}
            <SpellLink id={TALENTS.BURNING_RUSH_TALENT.id} icon /> or mitigate incoming damage with{' '}
            <SpellLink id={SPELLS.UNENDING_RESOLVE.id} icon />/
            <SpellLink id={TALENTS.DARK_PACT_TALENT.id} icon />.<br />
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
            You should try to avoid doing nothing during the fight. When you're out of Soul Shards,
            cast <SpellLink id={SPELLS.SHADOW_BOLT_AFFLI.id} icon />/
            <SpellLink id={TALENTS.DRAIN_SOUL_TALENT.id} icon />, refresh your DoTs etc. When you
            have to move, use your instant abilities or try to utilize{' '}
            <SpellLink id={SPELLS.DEMONIC_CIRCLE.id} icon>
              Teleport
            </SpellLink>{' '}
            or{' '}
            <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon>
              Gateway
            </SpellLink>{' '}
            to reduce the movement even further.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default AfflictionWarlockChecklist;
