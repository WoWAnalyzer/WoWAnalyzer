import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import SpellLink from 'common/SpellLink';

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
              Using your core abilities as often as possible can help raise your dps significantly. Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible, unless you need to save them for a priority burst phase that is coming up soon.
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
          name="Minimize Downtime"
          description={(
            <>
              Downtime is the time where you are not casting (and not on GCD) or are on GCD from a cancelled cast. Ensure you are casting as much as possible by avoiding movement when you could be casting. Elemental shaman has many GCDs available from <SpellLink id={SPELLS.EARTH_SHOCK.id} />, <SpellLink id={SPELLS.LAVA_SURGE.id} /> empowered <SpellLink id={SPELLS.LAVA_BURST.id} />s, <SpellLink id={SPELLS.FROST_SHOCK.id} />, and others that help you move towards your location without incurring downtime. Additionally, cancelled casts contribute significantly as they fill a GCD without actually doing damage. It's expected that some casts will need to be cancelled due to mechanics, but proper planning can help mitigate that.
            </>
          )}
        >
          <Requirement name="Downtime" thresholds={thresholds.downtime} />
          <Requirement name="Cancelled casts" thresholds={thresholds.cancelledCasts} />
        </Rule>
        {combatant.hasTalent(SPELLS.ICEFURY_TALENT.id) && (
        <Rule
          name={<>Utilize all Icefury Stacks</>}
          description={(
            <>
              <SpellLink id={SPELLS.ICEFURY_TALENT.id} />'s damage component itself is not a strong spell so it's important to fully utilize the talent by consuming all 4 <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> buff stacks with <SpellLink id={SPELLS.FROST_SHOCK.id} /> casts during the buff's duration. 
              {combatant.hasTalent(SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id) && <> While you should try to buff as many <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> empowered <SpellLink id={SPELLS.FROST_SHOCK.id} /> as you can with <SpellLink id={SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id} />, it is far more important to actually use all 4 charges before the buff expires.</>}
            </>
          )}>
          <Requirement name={<>Average <SpellLink id={SPELLS.FROST_SHOCK.id} /> Casts within <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> Duration</>} thresholds={thresholds.icefuryEfficiency} />
        </Rule>
        )}
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ElementalShamanChecklist;
