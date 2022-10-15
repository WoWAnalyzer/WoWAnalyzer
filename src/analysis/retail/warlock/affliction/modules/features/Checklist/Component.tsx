import SPELLS from 'common/SPELLS';
import shadowlandsSpells from 'common/SPELLS/shadowlands/covenants'
import talents from 'common/TALENTS/warlock';
import COVENANTS from 'game/shadowlands/COVENANTS';
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
          <SpellLink id={props.id} icon /> uptime
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
        <DotUptime id={SPELLS.AGONY.id} thresholds={thresholds.agony} />
        <DotUptime id={SPELLS.CORRUPTION_CAST.id} thresholds={thresholds.corruption} />
        <DotUptime id={SPELLS.UNSTABLE_AFFLICTION.id} thresholds={thresholds.unstableAffliction} />
        {combatant.hasTalent(talents.SHADOW_EMBRACE_TALENT.id) && (
          <DotUptime id={talents.SHADOW_EMBRACE_TALENT.id} thresholds={thresholds.shadowEmbrace} />
        )}
        <DotUptime id={talents.SHADOW_EMBRACE_TALENT.id} thresholds={thresholds.shadowEmbrace} />
        {combatant.hasTalent(talents.SIPHON_LIFE_TALENT.id) && (
          <DotUptime id={talents.SIPHON_LIFE_TALENT.id} thresholds={thresholds.siphonLife} />
        )}
        {combatant.hasTalent(talents.HAUNT_TALENT.id) && (
          <DotUptime id={talents.HAUNT_TALENT.id} thresholds={thresholds.haunt} />
        )}
      </Rule>
      <Rule
        name="Don't cap your Soul Shards"
        description="Soul Shards are your main and most important resource and since their generation is random as Affliction, it's very important not to let them cap."
      >
        <Requirement name="Wasted shards per minute" thresholds={thresholds.soulShardDetails}
        />
      </Rule>
      <Rule
        name="Use your cooldowns"
        description="Be mindful of your cooldowns if you are specced into them and use them when it's appropriate. It's okay to hold a cooldown for a little bit when the encounter requires it (burn phases), but generally speaking you should use them as much as you can."
      >
        {combatant.hasTalent(talents.SUMMON_DARKGLARE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SUMMON_DARKGLARE.id} />
        )}
        {combatant.hasTalent(talents.VILE_TAINT_TALENT.id) && (
          <AbilityRequirement spell={talents.VILE_TAINT_TALENT.id} />
        )}
        {combatant.hasTalent(talents.PHANTOM_SINGULARITY_TALENT.id) && (
          <AbilityRequirement spell={talents.PHANTOM_SINGULARITY_TALENT.id} />
        )}
        {combatant.hasTalent(talents.SOUL_ROT_TALENT.id) && (
          <AbilityRequirement spell={talents.SOUL_ROT_TALENT.id} />
        )}
        {/* covenant spells below. Here be dragons. */}
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <AbilityRequirement spell={shadowlandsSpells.SOUL_ROT.id} />
        )}
        {combatant.hasCovenant(COVENANTS.NECROLORD.id) && (
          <AbilityRequirement spell={shadowlandsSpells.DECIMATING_BOLT.id} />
        )}
        {combatant.hasCovenant(COVENANTS.VENTHYR.id) && (
          <AbilityRequirement spell={shadowlandsSpells.IMPENDING_CATASTROPHE_CAST.id} />
        )}
      </Rule>
      <Rule
        name="Use your utility and defensive spells"
        description={
          <>
            Use other spells in your toolkit to your advantage. For example, you can try to minimize
            necessary movement by using <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon />,{' '}
            <SpellLink id={SPELLS.DEMONIC_CIRCLE.id} icon />,{' '}
            <SpellLink id={talents.BURNING_RUSH_TALENT.id} icon /> or mitigate incoming damage with{' '}
            <SpellLink id={SPELLS.UNENDING_RESOLVE.id} icon />/
            <SpellLink id={talents.DARK_PACT_TALENT.id} icon />.<br />
            While you shouldn't cast these defensives on cooldown, be aware of them and use them
            whenever effective. Not using them at all indicates you might not be aware of them or
            not using them optimally.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.DEMONIC_CIRCLE_TELEPORT.id} />
        {combatant.hasTalent(talents.DARK_PACT_TALENT.id) && (
          <AbilityRequirement spell={talents.DARK_PACT_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.UNENDING_RESOLVE.id} />
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <AbilityRequirement spell={shadowlandsSpells.SOULSHAPE.id} />
        )}
      </Rule>
      <Rule
        name="Always be casting"
        description={
          <>
            You should try to avoid doing nothing during the fight. When you're out of Soul Shards,
            cast <SpellLink id={SPELLS.SHADOW_BOLT_AFFLI.id} icon />/
            <SpellLink id={talents.DRAIN_SOUL_TALENT.id} icon />, refresh your DoTs etc. When you
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
