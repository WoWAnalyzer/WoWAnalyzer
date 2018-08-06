import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';

import Checklist from 'Parser/Core/Modules/Features/Checklist2';
import Rule from 'Parser/Core/Modules/Features/Checklist2/Rule';
import GenericCastEfficiencyRequirement from 'Parser/Core/Modules/Features/Checklist2/GenericCastEfficiencyRequirement';
import PreparationRule from 'Parser/Core/Modules/Features/Checklist2/PreparationRule';
import Requirement from 'Parser/Core/Modules/Features/Checklist2/Requirement';

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
          <AbilityRequirement spell={SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id} />
          {combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) && <AbilityRequirement spell={SPELLS.FRACTURE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.FELBLADE_TALENT.id) && <AbilityRequirement spell={SPELLS.FELBLADE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.FEL_DEVASTATION_TALENT.id) && <AbilityRequirement spell={SPELLS.FEL_DEVASTATION_TALENT.id} />}
        </Rule>

        <Rule
          name="Use your short defensive/healing cooldowns"
          description={(
            <React.Fragment>
              <p>Use these to block damage spikes and keep damage smooth to reduce external healing required.</p>
              <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.DEMON_SPIKES.id} />
          {combatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id) && !combatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id) &&(
            <Requirement
              name={(
                <React.Fragment>
                  <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> 4+ souls casts
                </React.Fragment>
              )}
              thresholds={thresholds.spiritBombSoulsConsume}
            />
          )}
          {(!combatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id) && combatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id)) &&(
            <Requirement
              name={(
                <React.Fragment>
                  <SpellLink id={SPELLS.SOUL_CLEAVE.id} /> souls consumed
                </React.Fragment>
              )}
              thresholds={thresholds.soulCleaveSoulsConsumed}
            />
          )}
          {combatant.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id) && <AbilityRequirement spell={SPELLS.SOUL_BARRIER_TALENT.id} />}
         </Rule>

        <Rule
          name="Use your long defensive/healing cooldowns"
          description={(
            <React.Fragment>
              <p>Use these to mitigate large damage spikes or in emergency situations.</p>
              <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.METAMORPHOSIS_TANK.id} />
          <AbilityRequirement spell={SPELLS.FIERY_BRAND.id} />
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
          {combatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id) &&(
            <Requirement
              name={(
                <React.Fragment>
                  <SpellLink id={SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> debuff uptime
                </React.Fragment>
              )}
              thresholds={thresholds.spiritBombFrailtyDebuff}
            />
          )}
          {combatant.hasTalent(SPELLS.VOID_REAVER_TALENT.id) &&(
            <Requirement
              name={(
                <React.Fragment>
                  <SpellLink id={SPELLS.VOID_REAVER_TALENT.id} /> debuff uptime
                </React.Fragment>
              )}
              thresholds={thresholds.voidReaverDebuff}
            />
          )}
        </Rule>

        <Rule
          name="Important Items"
          description={(
            <React.Fragment>
              <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </React.Fragment>
          )}
        >
          {combatant.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id) && <AbilityRequirement spell={SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB.id} />}
        </Rule>



        <PreparationRule thresholds={thresholds} />

      </Checklist>
    );
  }
}

export default VengeanceDemonHunterChecklist;
