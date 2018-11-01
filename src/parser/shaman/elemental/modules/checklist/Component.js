import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';

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
              Using your core abilities as often as possible can help raise your dps significantly.Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible, unless you need to save them for a priority burst phase that is coming up soon.
              {'  '}
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

        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ElementalShamanChecklist;
