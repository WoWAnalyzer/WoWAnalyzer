import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import Checklist from 'Parser/Core/Modules/Features/Checklist2';
import Rule from 'Parser/Core/Modules/Features/Checklist2/Rule';
import GenericCastEfficiencyRequirement from 'Parser/Core/Modules/Features/Checklist2/GenericCastEfficiencyRequirement';
import PreparationRule from 'Parser/Core/Modules/Features/Checklist2/PreparationRule';

class HavocDemonHunterChecklist extends React.PureComponent {
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
          name="Use your short cooldowns"
          description={(
            <React.Fragment>
              <p>These should generally always be on recharge to maximize DPS and efficiency.</p>
              <a href="http://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.FEL_RUSH.id} />
          {combatant.hasTalent(SPELLS.IMMOLATION_AURA_TALENT.id) && <AbilityRequirement spell={SPELLS.IMMOLATION_AURA_TALENT.id} />}
        </Rule>

        <Rule
          name="Maintain your buffs and debuffs"
          description={(
            <React.Fragment>
              <p>It is important to maintain these as they contribute a large amount to your DPS and HPS.</p>
              <a href="http://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          {combatant.hasTalent(SPELLS.NEMESIS_TALENT.id) && <AbilityRequirement spell={SPELLS.NEMESIS_TALENT.id} />}
          {combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) && <AbilityRequirement spell={SPELLS.MOMENTUM_TALENT.id} />}
        </Rule>

        <Rule
          name="Use your offensive cooldowns"
          description={(
            <React.Fragment>
              <p>You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value.</p>
              <a href="http://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.METAMORPHOSIS_HAVOC.id} />
          <AbilityRequirement spell={SPELLS.EYE_BEAM.id} />
        </Rule>

        <PreparationRule thresholds={thresholds} />

      </Checklist>
    );
  }
}

export default HavocDemonHunterChecklist;
