import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import Requirement from 'parser/shared/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellIcon from 'common/SpellIcon';

class BeastMasteryChecklist extends React.PureComponent {
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
  };

  render() {
    const { combatant, castEfficiency, thresholds } = this.props;
    const AbilityRequirement = props => (
      <GenericCastEfficiencyRequirement
        castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
        {...props}
      />
    );
    return (
      <Checklist>
        <Rule
          name="Use core abilities as often as possible"
          description={(
            <>
              Using your core abilities as often as possible can help raise your dps significantly. Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible, unless you need to save them for a prioirty burst phase that is coming up soon.
              {'  '}
              <a href="https://www.icy-veins.com/wow/beast-mastery-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.KILL_COMMAND_CAST_BM.id} />
          <AbilityRequirement spell={SPELLS.BARBED_SHOT.id} />
          <AbilityRequirement spell={SPELLS.BESTIAL_WRATH.id} />
          <AbilityRequirement spell={SPELLS.ASPECT_OF_THE_WILD.id} />
          {combatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id) && <AbilityRequirement spell={SPELLS.DIRE_BEAST_TALENT.id} />}
          {combatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT.id) && <AbilityRequirement spell={SPELLS.CHIMAERA_SHOT_TALENT.id} />}
          {combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT.id) && <AbilityRequirement spell={SPELLS.A_MURDER_OF_CROWS_TALENT.id} />}
          {combatant.hasTalent(SPELLS.BARRAGE_TALENT.id) && <AbilityRequirement spell={SPELLS.BARRAGE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.STAMPEDE_TALENT.id) && <AbilityRequirement spell={SPELLS.STAMPEDE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id) && <AbilityRequirement spell={SPELLS.SPITTING_COBRA_TALENT.id} />}
        </Rule>
        <Rule
          name="Barbed Shot usage"
          description={(
            <>
              Using <SpellLink id={SPELLS.BARBED_SHOT.id} /> properly is a key to achieving high dps. This means maintaining the pet buff from <SpellLink id={SPELLS.BARBED_SHOT.id} /> as long as possible, and using it to reduce the cooldown of <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> as much as possible, to ensure high uptime on <SpellLink id={SPELLS.BESTIAL_WRATH.id} />.
            </>
          )}
        >
          <Requirement name={<>Uptime of <SpellLink id={SPELLS.BARBED_SHOT_PET_BUFF.id} /> </>} thresholds={thresholds.frenzyUptimeSuggestionThreshold} />
          <Requirement name={<>3 stack uptime of <SpellLink id={SPELLS.BARBED_SHOT_PET_BUFF.id} /> </>} thresholds={thresholds.frenzy3StackSuggestionThreshold} />
          <Requirement name={<><SpellLink id={SPELLS.BESTIAL_WRATH.id} /> CDR Efficiency</>} thresholds={thresholds.bestialWrathCDREfficiencyThreshold} />
        </Rule>
        <Rule
          name="Talent, cooldown and spell efficiency"
          description={(
            <>
              You want to be using your baseline spells as efficiently as possible, as well as choosing the right talents for the given scenario. If a talent isn't being used optimally for the encounter, you should consider swapping to a different talent.
            </>
          )}
        >
          <Requirement name={<><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> Average focus on <SpellIcon id={SPELLS.BESTIAL_WRATH.id} /> cast </>} thresholds={thresholds.bestialWrathFocusThreshold} />
          <Requirement name={<><SpellIcon id={SPELLS.COBRA_SHOT.id} /><SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} icon={false} /> CDR efficiency</>} thresholds={thresholds.cobraShotCDREfficiencyThreshold} />
          {combatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id) && <Requirement name={<> Wasted <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} /> resets </>} thresholds={thresholds.wastedKillerCobraThreshold} />}
        </Rule>
        <Rule
          name={<>Downtime & <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> focus capping</>}
          description={(
            <>
              As a DPS, you should try to reduce the delay between casting spells, and stay off resource capping as much as possible. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap and do some damage.
            </>
          )}
        >
          <Requirement name={<> Active time</>} thresholds={thresholds.downtimeSuggestionThresholds} />
          <Requirement name={<><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> Time focus capped</>} thresholds={thresholds.focusCappedSuggestionThresholds} />
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default BeastMasteryChecklist;
