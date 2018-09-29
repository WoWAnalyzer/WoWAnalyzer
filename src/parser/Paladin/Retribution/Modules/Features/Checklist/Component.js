import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/core/modules/features/Checklist2';
import Rule from 'parser/core/modules/features/Checklist2/Rule';
import Requirement from 'parser/core/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/core/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/core/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class RetributionPaladinChecklist extends React.PureComponent {
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
          name="Always be casting"
          description={(
            <React.Fragment>
              You should try to avoid doing nothing during the fight. If you have to move, use your <SpellLink id={SPELLS.DIVINE_STEED.id} icon /> to minimize downtime. Also use ranged abilities like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> or <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon /> if you are out of melee range for extended periods of time.
            </React.Fragment>
          )}
          >
          <Requirement name="Downtime" thresholds={thresholds.alwaysBeCasting} />
        </Rule>
        <Rule
          name="Use core abilities as often as possible"
          description={(
            <React.Fragment>
              Spells with short cooldowns like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />, <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} icon />, and <SpellLink id={SPELLS.CRUSADER_STRIKE.id} icon /> should be used as often as possible.
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.CRUSADER_STRIKE.id} />
          <AbilityRequirement spell={SPELLS.JUDGMENT_CAST.id} />
          <AbilityRequirement spell={SPELLS.BLADE_OF_JUSTICE.id} />
          {combatant.hasTalent(SPELLS.CONSECRATION_TALENT.id) && <AbilityRequirement spell={SPELLS.CONSECRATION_TALENT.id} />}
        </Rule>
        <Rule
          name="Use your cooldowns"
          description={(
            <React.Fragment>
              Retribution Paladin is a very cooldown dependant spec. Make sure you are keeping spells like <SpellLink id={combatant.hasTalent(SPELLS.CRUSADE_TALENT.id) ? SPELLS.CRUSADE_TALENT.id : SPELLS.AVENGING_WRATH.id} icon /> and <SpellLink id={SPELLS.WAKE_OF_ASHES_TALENT.id} /> on cooldown.
            </React.Fragment>
          )}
        >
          {combatant.hasTalent(SPELLS.CRUSADE_TALENT.id) && <AbilityRequirement spell={SPELLS.CRUSADE_TALENT.id} />}
          {!combatant.hasTalent(SPELLS.CRUSADE_TALENT.id) && <AbilityRequirement spell={SPELLS.AVENGING_WRATH.id} />}
          {combatant.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id) && <AbilityRequirement spell={SPELLS.WAKE_OF_ASHES_TALENT.id} />}
          {combatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id) && <AbilityRequirement spell={SPELLS.EXECUTION_SENTENCE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.CRUSADE_TALENT.id) && (
            <Requirement
              name={(
                <React.Fragment>
                  Good first global with <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon /> buff
                </React.Fragment>
              )}
              thresholds={thresholds.crusade}
            />
          )}
        </Rule>
        <Rule
          name="Use procs and buffs efficiently"
          description={(
            <React.Fragment>
              Buffs and procs like <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon />, <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> and <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> have a significant impact on your damage, use them well
          </React.Fragment>
          )}
        >
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> procs used
              </React.Fragment>
            )}
            thresholds={thresholds.artOfWar}
          />
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuffs consumed
              </React.Fragment>
            )}
            thresholds={thresholds.judgment}
          />
          {combatant.hasTalent(SPELLS.INQUISITION_TALENT.id) && (
            <Requirement
              name={(
                <React.Fragment>
                  Damage empowered by <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon />
                </React.Fragment>
              )}
              thresholds={thresholds.inquisition}
            />
          )}
          {combatant.hasTalent(SPELLS.RIGHTEOUS_VERDICT_TALENT.id) && (
            <Requirement
              name={(
                <React.Fragment>
                  <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> efficiency
                </React.Fragment>
              )}
              thresholds={thresholds.righteousVerdict}
            />
          )}
          {combatant.hasTrait(SPELLS.RELENTLESS_INQUISITOR.id) && (
            <Requirement
              name={(
                <React.Fragment>
                  Average <SpellLink id={SPELLS.RELENTLESS_INQUISITOR.id} icon /> stacks
                  </React.Fragment>
              )}
              thresholds={thresholds.relentlessInquisitor}
            />
          )}
        </Rule>
        <Rule
          name="Use your Holy Power efficently"
          description="Holy Power is your main resource, it's very important not to waste it."
        >
          <Requirement
            name="Holy Power efficiency"
            thresholds={thresholds.holyPowerDetails}
          />
        </Rule>
        <PreparationRule thresholds={thresholds} />
        <Rule
          name="Use your utility and defensive spells"
          description={(
            <React.Fragment>
              Use other spells in your toolkit to your advantage. For example, you can use <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} icon /> to mitigate some damage and <SpellLink id={SPELLS.LAY_ON_HANDS.id} icon /> to save your own or someone elses life.
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.SHIELD_OF_VENGEANCE.id} />
          <AbilityRequirement spell={SPELLS.LAY_ON_HANDS.id} />
          <Requirement
            name={(
              <React.Fragment>
                <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} icon /> Absorb Used
              </React.Fragment>
            )}
            thresholds={thresholds.shieldOfVengeance}
          />
        </Rule>
      </Checklist>
    );
  }
}

export default RetributionPaladinChecklist;
