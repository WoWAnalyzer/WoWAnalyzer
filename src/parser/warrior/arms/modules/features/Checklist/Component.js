import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import Requirement from 'parser/shared/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class ArmWarriorChecklist extends React.PureComponent {
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

    const DotUptime = props => (
      <Requirement
        name={(<><SpellLink id={props.id} icon /> uptime</>)}
        thresholds={props.thresholds}
      />
    );

    const AbilityRequirement = props => (
      <GenericCastEfficiencyRequirement
        castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
        {...props}
      />
    );

    return (
      <Checklist>
        <Rule
          name="Use core abilities and offensive cooldowns as often as possible"
          description={(
            <>
              Spells such as <SpellLink id={SPELLS.COLOSSUS_SMASH.id} /> (or <SpellLink id={SPELLS.WARBREAKER_TALENT.id} /> if talented), <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> and <SpellLink id={SPELLS.OVERPOWER.id} /> are your most efficient spells available, try to cast them as much as possible.
              Keep in mind that it is sometimes more useful to keep <SpellLink id={SPELLS.BLADESTORM.id} /> (or <SpellLink id={SPELLS.RAVAGER_TALENT_ARMS.id} />) and use it when several targets are present in the fight. &nbsp;
              <a href="https://www.wowhead.com/arms-warrior-rotation-guide" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          {<AbilityRequirement spell={combatant.hasTalent(SPELLS.WARBREAKER_TALENT.id) ? SPELLS.WARBREAKER_TALENT.id : SPELLS.COLOSSUS_SMASH.id} />}
          {<AbilityRequirement spell={combatant.hasTalent(SPELLS.RAVAGER_TALENT_ARMS.id) ? SPELLS.RAVAGER_TALENT_ARMS.id : SPELLS.BLADESTORM.id} />}
          {combatant.hasTalent(SPELLS.SKULLSPLITTER_TALENT.id) && <AbilityRequirement spell={SPELLS.SKULLSPLITTER_TALENT.id} />}
          <AbilityRequirement spell={SPELLS.OVERPOWER.id} />
          {combatant.hasTalent(SPELLS.AVATAR_TALENT.id) && <AbilityRequirement spell={SPELLS.AVATAR_TALENT.id} />}
          {combatant.hasTalent(SPELLS.REND_TALENT.id) && <DotUptime id={SPELLS.REND_TALENT.id} thresholds={thresholds.rend} />}
          {combatant.hasTalent(SPELLS.DEADLY_CALM_TALENT.id) && <AbilityRequirement spell={SPELLS.DEADLY_CALM_TALENT.id} />}
        </Rule>

        <Rule
          name={(<>Use <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> efficiently</>)}
          description={(
            <>
              Mortal Strike shouldn't be used during the execution phase, you should cast it as much as possible when the target is above 20% (or 35% with <SpellLink id={SPELLS.MASSACRE_TALENT_ARMS.id} />) but avoid casting it when you reach the execution phase and use <SpellLink id={SPELLS.EXECUTE.id} /> instead since it is more rage efficient.
            </>
          )}
        >
            <Requirement
              name={(<><SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> outside execution phase</>)}
              thresholds={thresholds.goodMortalStrike}
            />
            <Requirement
              name={(<><SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> during execution phase</>)}
              thresholds={thresholds.badMortalStrike}
            />
        </Rule>
        <Rule
          name="Use your defensive cooldowns"
          description="While you shouldn't cast these defensives on cooldown, be aware of them and use them whenever effective. Not using them at all indicates you might not be aware of them or not using them optimally."
        >
          <AbilityRequirement spell={SPELLS.DIE_BY_THE_SWORD.id} />
          <AbilityRequirement spell={SPELLS.RALLYING_CRY.id} />
        </Rule>
        <Rule
          name="Avoid downtime"
          description={(
            <>
              As a melee DPS, it is important to stay within range of the target and cast your abilities promptly. If you find yourself out of range, try using <SpellLink id={SPELLS.CHARGE.id} /> and <SpellLink id={SPELLS.HEROIC_LEAP.id} /> to get back more quickly.
            </>
          )}
        >
          <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ArmWarriorChecklist;
