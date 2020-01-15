import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const DestructionWarlockChecklist = ({ combatant, castEfficiency, thresholds, shardTracker }) => {
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
        name="Use your core spells"
        description={(
          <>
            Destruction Warlocks have a simple rotation core. Maintain your <SpellLink id={SPELLS.IMMOLATE.id} /> on all enemies if possible, don't waste your <SpellLink id={SPELLS.CONFLAGRATE.id} /> and <SpellLink id={SPELLS.BACKDRAFT.id} /> stacks. Use <SpellLink id={SPELLS.HAVOC.id} /> whenever there's something else to cleave.
          </>
        )}
      >
        <Requirement
          name={<><SpellLink id={SPELLS.IMMOLATE.id} /> uptime</>}
          thresholds={thresholds.immolate}
        />
        <AbilityRequirement spell={SPELLS.CONFLAGRATE.id} />
        <Requirement
          name={<>Wasted <SpellLink id={SPELLS.BACKDRAFT.id} /> stacks per minute</>}
          thresholds={thresholds.wastedBackdraft}
        />
      </Rule>
      <Rule
        name="Don't cap your Soul Shard Fragments"
        description="Soul Shards are your most important resource and since you are in control of their generation, it's very important to plan your rotation and not let them cap."
      >
        <Requirement
          name="Wasted fragments per minute"
          thresholds={thresholds.soulShards}
          valueTooltip={`You wasted ${shardTracker.wasted} fragments.`}
        />
      </Rule>
      <Rule
        name="Use your cooldowns and talents"
        description="Be mindful of your talent choices and use them when it's appropriate. It's okay to hold on a cooldown for a little bit when the encounter requires it (burn phases or priority targets), but generally speaking you should use them as much as you can."
      >
        {combatant.hasTalent(SPELLS.ERADICATION_TALENT.id) && (
          <Requirement
            name={<><SpellLink id={SPELLS.ERADICATION_TALENT.id} /> uptime</>}
            thresholds={thresholds.eradication}
          />
        )}
        {combatant.hasTalent(SPELLS.SHADOWBURN_TALENT.id) && <AbilityRequirement spell={SPELLS.SHADOWBURN_TALENT.id} />}
        {combatant.hasTalent(SPELLS.CATACLYSM_TALENT.id) && <AbilityRequirement spell={SPELLS.CATACLYSM_TALENT.id} />}
        {combatant.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id) && <AbilityRequirement spell={SPELLS.CHANNEL_DEMONFIRE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.SOUL_FIRE_TALENT.id) && <AbilityRequirement spell={SPELLS.SOUL_FIRE_TALENT.id} />}
        <AbilityRequirement spell={SPELLS.SUMMON_INFERNAL.id} />
        {combatant.hasTalent(SPELLS.DARK_SOUL_INSTABILITY_TALENT.id) && <AbilityRequirement spell={SPELLS.DARK_SOUL_INSTABILITY_TALENT.id} />}
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
            You should try to avoid doing nothing during the fight. When you have to move, try to save some <SpellLink id={SPELLS.CONFLAGRATE.id} /> charges or try to utilize <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon>Teleport</SpellLink> or <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon>Gateway</SpellLink> to reduce the movement even further.
          </>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

DestructionWarlockChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
  shardTracker: PropTypes.object.isRequired,
};

export default DestructionWarlockChecklist;
