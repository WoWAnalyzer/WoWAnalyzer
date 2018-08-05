import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Checklist from 'Parser/Core/Modules/Features/Checklist2';
import Rule from 'Parser/Core/Modules/Features/Checklist2/Rule';
import GenericCastEfficiencyRequirement from 'Parser/Core/Modules/Features/Checklist2/GenericCastEfficiencyRequirement';
import PreparationRule from 'Parser/Core/Modules/Features/Checklist2/PreparationRule';

class VengeanceDemonHunterChecklist extends React.PureComponent {
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
              <p>These should generally always be on recharge to maximize DPS, HPS and efficiency.</p>
              <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.IMMOLATION_AURA.id} />
          {combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) && <AbilityRequirement spell={SPELLS.FRACTURE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.FELBLADE_TALENT.id) && <AbilityRequirement spell={SPELLS.FELBLADE_TALENT.id} />}
        </Rule>

        <Rule
          name="Maintain your buffs and debuffs"
          description={(
            <React.Fragment>
              <p>It is important to maintain these as they contribute a large amount to your DPS and HPS.</p>
              <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          {/* As I can't track the cast efficiency with Feed the Demon talent equipped, I'm disabling the checklist item */}
          {!combatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id) && <AbilityRequirement spell={SPELLS.DEMON_SPIKES.id} />}
          <AbilityRequirement spell={SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id} />
        </Rule>

        <Rule
          name="Use your defensive cooldowns"
          description={(
            <React.Fragment>
              <p>Use these to block damage spikes and keep damage smooth to reduce external healing required.</p>
              <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.METAMORPHOSIS_TANK.id} />
          <AbilityRequirement spell={SPELLS.FIERY_BRAND.id} />
          {combatant.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id) && <AbilityRequirement spell={SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB.id} />}
        </Rule>

        <PreparationRule thresholds={thresholds} />

      </Checklist>
    );
  }
}

export default VengeanceDemonHunterChecklist;
