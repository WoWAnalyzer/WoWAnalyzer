import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const DemonologyWarlockChecklist = ({ combatant, castEfficiency, thresholds, shardTracker }) => {
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
        name="Use your core spells"
        description={<>Demonology has a lot of short cooldowns that make up majority of your rotation, such as <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} /> or Felguard's <SpellLink id={SPELLS.FELSTORM_BUFF.id} />. Try to use them as much as possible.</>}
      >
        <AbilityRequirement spell={SPELLS.CALL_DREADSTALKERS.id} />
        <Requirement
          name={(<SpellLink id={SPELLS.FELSTORM_BUFF.id} />)}
          thresholds={thresholds.felstorm}
        />
        {combatant.hasTalent(SPELLS.BILESCOURGE_BOMBERS_TALENT.id) && <AbilityRequirement spell={SPELLS.BILESCOURGE_BOMBERS_TALENT.id} />}
        {combatant.hasTalent(SPELLS.POWER_SIPHON_TALENT.id) && <AbilityRequirement spell={SPELLS.POWER_SIPHON_TALENT.id} />}
        {combatant.hasTalent(SPELLS.DOOM_TALENT.id) && <DotUptime id={SPELLS.DOOM_TALENT.id} thresholds={thresholds.doom} />}
        {combatant.hasTalent(SPELLS.SOUL_STRIKE_TALENT.id) && <AbilityRequirement spell={SPELLS.SOUL_STRIKE_TALENT.id} />}
      </Rule>
      <Rule
        name="Don't cap your Soul Shards"
        description="Avoid overcapping Soul Shards."
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
        <AbilityRequirement spell={SPELLS.SUMMON_DEMONIC_TYRANT.id} />
        {combatant.hasTalent(SPELLS.DEMONIC_STRENGTH_TALENT.id) && <AbilityRequirement spell={SPELLS.DEMONIC_STRENGTH_TALENT.id} />}
        {combatant.hasTalent(SPELLS.SUMMON_VILEFIEND_TALENT.id) && <AbilityRequirement spell={SPELLS.SUMMON_VILEFIEND_TALENT.id} />}
        {combatant.hasTalent(SPELLS.GRIMOIRE_FELGUARD_TALENT.id) && <AbilityRequirement spell={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} />}
        {combatant.hasTalent(SPELLS.NETHER_PORTAL_TALENT.id) && <AbilityRequirement spell={SPELLS.NETHER_PORTAL_TALENT.id} />}
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
            You should try to avoid doing nothing during the fight. When you're waiting for cooldowns, keep building Soul Shards to summon additional Wild Imps. When you have to move, use your instant abilities like <SpellLink id={SPELLS.DEMONBOLT.id} /> (with Demonic Core) or <SpellLink id={SPELLS.SOUL_STRIKE_TALENT.id} /> or try to utilize <SpellLink id={SPELLS.DEMONIC_CIRCLE_TALENT.id} icon>Teleport</SpellLink> or <SpellLink id={SPELLS.DEMONIC_GATEWAY_CAST.id} icon>Gateway</SpellLink> to reduce the movement even further.
          </>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

DemonologyWarlockChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
  shardTracker: PropTypes.object.isRequired,
};

export default DemonologyWarlockChecklist;
