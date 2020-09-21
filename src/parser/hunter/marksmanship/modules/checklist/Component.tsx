import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';

const MarksmanshipChecklist = ({ combatant, castEfficiency, thresholds }: any) => {

  const AbilityRequirement = (props: any) => (
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
        name="Use core abilities as often as possible"
        description={(
          <>
            Using your core abilities as often as possible can help raise your dps significantly. Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible, unless you need to save them for a prioirty burst phase that is coming up soon.
            {'  '}
            <a href="https://www.icy-veins.com/wow/marksmanship-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a>
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.AIMED_SHOT.id} />
        <AbilityRequirement spell={SPELLS.RAPID_FIRE.id} />
        <AbilityRequirement spell={SPELLS.TRUESHOT.id} />
        <AbilityRequirement spell={SPELLS.KILL_SHOT_MM_BM.id} />

        {combatant.hasTalent(SPELLS.DOUBLE_TAP_TALENT.id) &&
        <AbilityRequirement spell={SPELLS.DOUBLE_TAP_TALENT.id} />}

        {combatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id) &&
        <AbilityRequirement spell={SPELLS.EXPLOSIVE_SHOT_TALENT.id} />}

        {combatant.hasTalent(SPELLS.BARRAGE_TALENT.id) &&
        <AbilityRequirement spell={SPELLS.BARRAGE_TALENT.id} />}

        {combatant.hasTalent(SPELLS.VOLLEY_TALENT.id) &&
        <AbilityRequirement spell={SPELLS.VOLLEY_TALENT.id} />}

        {combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT.id) &&
        <AbilityRequirement spell={SPELLS.A_MURDER_OF_CROWS_TALENT.id} />}
      </Rule>

      <Rule
        name="Talent, cooldown and spell efficiency"
        description={(
          <>
            You want to be using your baseline spells as efficiently as possible, as well as choosing the right talents for the given scenario. If a talent isn't being used optimally for the encounter, you should consider swapping to a different talent.
          </>
        )}
      >

        <Requirement name={<><SpellLink id={SPELLS.PRECISE_SHOTS.id} /> utilization</>} thresholds={thresholds.preciseShotsThresholds} />

        <Requirement name={<><SpellLink id={SPELLS.HUNTERS_MARK.id} /> debuff uptime</>} thresholds={thresholds.huntersMarkThresholds} />

        {combatant.hasTalent(SPELLS.SERPENT_STING_TALENT.id) && <Requirement name={<><SpellLink id={SPELLS.SERPENT_STING_TALENT.id} /> uptime</>} thresholds={thresholds.uptimeThreshold} />}

        {combatant.hasTalent(SPELLS.SERPENT_STING_TALENT.id) && <Requirement name={<>Refreshes of <SpellLink id={SPELLS.SERPENT_STING_TALENT.id} /> that didn't pandemic </>} thresholds={thresholds.nonPandemicThreshold} />}

        {combatant.hasTalent(SPELLS.CALLING_THE_SHOTS_TALENT.id) && <Requirement name={<><SpellLink id={SPELLS.CALLING_THE_SHOTS_TALENT.id} /> CDR efficiency </>} thresholds={thresholds.callingTheShotsThresholds} />}

        {combatant.hasTalent(SPELLS.DEAD_EYE_TALENT.id) && <Requirement name={<><SpellLink id={SPELLS.AIMED_SHOT.id} /> recharge efficiency from <SpellLink id={SPELLS.DEAD_EYE_TALENT.id} /></>} thresholds={thresholds.deadEyeThresholds} />}

        {combatant.hasTalent(SPELLS.LETHAL_SHOTS_TALENT.id) && <Requirement name={<>Potential <SpellLink id={SPELLS.LETHAL_SHOTS_TALENT.id} /> triggers when <SpellLink id={SPELLS.RAPID_FIRE.id} /> isn't on CD</>} thresholds={thresholds.lethalShotsThresholds} />}

        {combatant.hasTalent(SPELLS.STEADY_FOCUS_TALENT.id) && <Requirement name={<><SpellLink id={SPELLS.STEADY_FOCUS_TALENT.id} /> buff uptime</>} thresholds={thresholds.steadyFocusThresholds} />}
      </Rule>

      <Rule
        name={<>Downtime & <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink={false} /> focus capping</>}
        description={(
          <>
            As a DPS, you should try to reduce the delay between casting spells, and stay off resource capping as much as possible. If everything is on cooldown, try and use {combatant.hasTalent(SPELLS.CHIMAERA_SHOT_MM_TALENT.id) ? <SpellLink id={SPELLS.CHIMAERA_SHOT_MM_TALENT.id} /> : <SpellLink id={SPELLS.ARCANE_SHOT.id} />} to stay off the focus cap and do some damage.
          </>
        )}
      >
        <Requirement name="Active time" thresholds={thresholds.downtimeSuggestionThresholds} />

        <Requirement name="Effective Focus from generators" thresholds={thresholds.focusGeneratorWasteThresholds} />

        <Requirement name="Effective Focus from natural regen" thresholds={thresholds.focusNaturalRegenWasteThresholds} />
      </Rule>

      <PreparationRule thresholds={thresholds} />

    </Checklist>
  );
};

MarksmanshipChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default MarksmanshipChecklist;
