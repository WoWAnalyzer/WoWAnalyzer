import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const BloodDeathKnightChecklist = ({ combatant, castEfficiency, thresholds }) => {
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
        name="Use your short cooldowns"
        description="These should generally always be recharging to maximize efficiency."
      >
        <AbilityRequirement spell={SPELLS.BLOOD_BOIL.id} />
        {combatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id) && <AbilityRequirement spell={SPELLS.DEATH_AND_DECAY.id} />}
        {combatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id) && <AbilityRequirement spell={SPELLS.BLOODDRINKER_TALENT.id} />}
        {combatant.hasTalent(SPELLS.RUNE_STRIKE_TALENT.id) && <AbilityRequirement spell={SPELLS.RUNE_STRIKE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id) && (
          <Requirement
            name={<><SpellLink id={SPELLS.CRIMSON_SCOURGE.id} /> procs spent</>}
            thresholds={thresholds.crimsonScourge}
          />
        )}
      </Rule>
      <Rule
        name="Do not overcap your resources"
        description="Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities. Try to spend Runic Power before reaching the maximum amount and always keep atleast 3 Runes on cooldown to avoid wasting resources."
      >
        <Requirement
          name="Runic Power Efficiency"
          thresholds={thresholds.runicPower}
        />
        <Requirement
          name="Rune Efficiency"
          thresholds={thresholds.runes}
        />
        <Requirement
          name={<><SpellLink id={SPELLS.MARROWREND.id} /> Efficiency</>}
          thresholds={thresholds.marrowrend}
        />
        {combatant.hasTalent(SPELLS.RUNE_STRIKE_TALENT.id) && (
          <Requirement
            name={<><SpellLink id={SPELLS.RUNE_STRIKE_TALENT.id} /> Efficiency</>}
            thresholds={thresholds.runestrike}
          />
        )}
        <Requirement
          name={<><SpellLink id={SPELLS.DEATHS_CARESS.id} /> Efficiency</>}
          thresholds={thresholds.deathsCaress}
        />
      </Rule>

      <Rule
        name="Use your offensive cooldowns"
        description="You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value."
      >
        <AbilityRequirement spell={SPELLS.DANCING_RUNE_WEAPON.id} />
        {combatant.hasTalent(SPELLS.CONSUMPTION_TALENT.id) && (
          <Requirement
            name={<>Possible <SpellLink id={SPELLS.CONSUMPTION_TALENT.id} /> Hits</>}
            thresholds={thresholds.consumption}
          />
        )}
        {combatant.hasTalent(SPELLS.BONESTORM_TALENT.id) && (
          <Requirement
            name={<><SpellLink id={SPELLS.BONESTORM_TALENT.id} /> Efficiency</>}
            thresholds={thresholds.bonestorm}
          />
        )}
      </Rule>
      <Rule
        name="Maintain your buffs and debuffs"
        description="It is important to maintain these as they contribute a large amount to your DPS and HPS."
      >
        <Requirement
          name={<><SpellLink id={SPELLS.BLOOD_PLAGUE.id} /> Uptime</>}
          thresholds={thresholds.bloodPlague}
        />
        {combatant.hasTalent(SPELLS.MARK_OF_BLOOD_TALENT.id) && (
          <Requirement
            name={<><SpellLink id={SPELLS.MARK_OF_BLOOD_TALENT.id} /> Uptime</>}
            thresholds={thresholds.markOfBlood}
          />
        )}
        <Requirement
          name={<><SpellLink id={SPELLS.BONE_SHIELD.id} /> Uptime</>}
          thresholds={thresholds.boneShield}
        />
        {combatant.hasTalent(SPELLS.OSSUARY_TALENT.id) && (
          <Requirement
            name={<><SpellLink id={SPELLS.OSSUARY_TALENT.id} /> Uptime</>}
            thresholds={thresholds.ossuary}
          />
        )}
      </Rule>
      <Rule
        name="Use your defensive cooldowns"
        description="Use these to block damage spikes and keep damage smooth to reduce external healing required."
      >
        <AbilityRequirement spell={SPELLS.VAMPIRIC_BLOOD.id} />
        <AbilityRequirement spell={SPELLS.ICEBOUND_FORTITUDE.id} />
        <AbilityRequirement spell={SPELLS.ANTI_MAGIC_SHELL.id} />
        {combatant.hasTalent(SPELLS.RUNE_TAP_TALENT.id) && <AbilityRequirement spell={SPELLS.RUNE_TAP_TALENT.id} />}
        {combatant.hasTalent(SPELLS.TOMBSTONE_TALENT.id) && <AbilityRequirement spell={SPELLS.TOMBSTONE_TALENT.id} />}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

BloodDeathKnightChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default BloodDeathKnightChecklist;
