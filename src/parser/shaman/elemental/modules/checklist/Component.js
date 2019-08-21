import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

class ElementalShamanChecklist extends React.PureComponent {
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
    console.log(this.props);
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
              Using your core abilities as often as possible can help raise your dps significantly. 8Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible, unless you need to save them for a priority burst phase that is coming up soon.
              {'\u00a0'}
              <a href="https://stormearthandlava.com/guide/general/priority_list.html" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          {combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) && <AbilityRequirement spell={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} />}
          {!combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id) && <AbilityRequirement spell={SPELLS.FIRE_ELEMENTAL.id} />}
          {combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id) && <AbilityRequirement spell={SPELLS.STORM_ELEMENTAL_TALENT.id} />}
          {combatant.hasTalent(SPELLS.ICEFURY_TALENT.id) && <AbilityRequirement spell={SPELLS.ICEFURY_TALENT.id} />}
          {combatant.hasTalent(SPELLS.STORMKEEPER_TALENT.id) && <AbilityRequirement spell={SPELLS.STORMKEEPER_TALENT.id} />}
          {combatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id) && <AbilityRequirement spell={SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id} />}
          {combatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id) && <AbilityRequirement spell={SPELLS.ELEMENTAL_BLAST_TALENT.id} />}
        </Rule>
        <Rule
          name="Avoid Downtime"
          description={(
            <>
              Downtime is defined as time where you are not casting and not on GCD. Or more simply put, time where you're doing nothing and thus not contributing to your DPS. This can largely be minimized by ABC (Always Be Casting) and minimizing movement by planning you positioning for abilities.
            </>
          )}
        >
          {/* <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} /> */}
          <Requirement name="Cancelled casts" thresholds={thresholds.cancelledCasts} />
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ElementalShamanChecklist;
