import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const AfflictionWarlockChecklist = ({ combatant, castEfficiency, thresholds, shardTracker }) => {
  const DotUptime = props => (
    <Requirement
      name={(
        <>
          <SpellLink id={props.id} icon /> uptime
        </>
      )}
      thresholds={props.thresholds}
    />
  );
  DotUptime.propTypes = {
    id: PropTypes.number.isRequired,
  };

  const AbilityRequirement = props => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

  return (
    <Checklist>
      <Rule
        name="Maintain your DoTs on the boss"
        description="Affliction Warlocks rely on DoTs as a means of dealing damage to the target. You should try to keep as highest uptime on them as possible."
      >
        <DotUptime id={SPELLS.AGONY.id} thresholds={thresholds.agony} />
        <DotUptime id={SPELLS.CORRUPTION_CAST.id} thresholds={thresholds.corruption} />
        <DotUptime id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} thresholds={thresholds.unstableAffliction} />
        {combatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id) && <DotUptime id={SPELLS.SIPHON_LIFE_TALENT.id} thresholds={thresholds.siphonLife} />}
      </Rule>
      <Rule
        name="Don't cap your Soul Shards"
        description="Soul Shards are your main and most important resource and since their generation is random as Affliction, it's very important not to let them cap."
      >
        <Requirement
          name="Wasted shards per minute"
          thresholds={thresholds.soulShards}
          valueTooltip={`You wasted ${shardTracker.wasted} shards.`}
        />
      </Rule>
      <Rule
        name="Use your cooldowns"
        description="Be mindful of your cooldowns if you are specced into them and use them when it's appropriate. It's okay to hold a cooldown for a little bit when the encounter requires it (burn phases), but generally speaking you should use them as much as you can."
      >
        <AbilityRequirement spell={SPELLS.SUMMON_DARKGLARE.id} />
        {combatant.hasTalent(SPELLS.DARK_SOUL_MISERY_TALENT.id) && <AbilityRequirement spell={SPELLS.DARK_SOUL_MISERY_TALENT.id} />}
        {combatant.hasTalent(SPELLS.VILE_TAINT_TALENT.id) && <AbilityRequirement spell={SPELLS.VILE_TAINT_TALENT.id} />}
        {combatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id) && <AbilityRequirement spell={SPELLS.PHANTOM_SINGULARITY_TALENT.id} />}
      </Rule>
      <Rule
        name="Use your utility and defensive spells"
        description={(
          <>
            Use other spells in your toolkit to your advantage. For example, you can try to minimize necessary movement by using <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon />, <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon />, <SpellLink id={SPELLS.BURNING_RUSH_TALENT.id} icon /> or mitigate incoming damage with <SpellLink id={SPELLS.UNENDING_RESOLVE.id} icon />/<SpellLink id={SPELLS.DARK_PACT_TALENT.id} icon />.<br />
            While you shouldn't cast these defensives on cooldown, be aware of them and use them whenever effective. Not using them at all indicates you might not be aware of them or not using them optimally.
          </>
        )}
      >
        {combatant.hasTalent(SPELLS.DEMONIC_CIRCLE_TALENT.id) && <AbilityRequirement spell={SPELLS.DEMONIC_CIRCLE_TELEPORT.id} />}
        {combatant.hasTalent(SPELLS.DARK_PACT_TALENT.id) && <AbilityRequirement spell={SPELLS.DARK_PACT_TALENT.id} />}
        <AbilityRequirement spell={SPELLS.UNENDING_RESOLVE.id} />
      </Rule>
      <Rule
        name="Always be casting"
        description={(
          <>
            You should try to avoid doing nothing during the fight. When you're out of Soul Shards, cast <SpellLink id={SPELLS.SHADOW_BOLT_AFFLI.id} icon />/<SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} icon />, refresh your DoTs etc. When you have to move, use your instant abilities or try to utilize <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon>Teleport</SpellLink> or <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon>Gateway</SpellLink> to reduce the movement even further.
          </>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

AfflictionWarlockChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
  shardTracker: PropTypes.object.isRequired,
};

export default AfflictionWarlockChecklist;
