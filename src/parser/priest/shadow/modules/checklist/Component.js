import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/core/modules/features/Checklist2';
import Rule from 'parser/core/modules/features/Checklist2/Rule';
import PreparationRule from 'parser/core/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/core/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class ShadowPriestChecklist extends React.PureComponent {
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
            <React.Fragment>
              Spells such as <SpellLink id={SPELLS.VOID_BOLT.id} />, <SpellLink id={SPELLS.MIND_BLAST.id} />, or <SpellLink id={SPELLS.SHADOW_WORD_VOID_TALENT.id} /> are your most important spells. Try to cast them as much as possible.
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.VOID_BOLT.id} />
          {combatant.hasTalent(SPELLS.DARK_ASCENSION_TALENT.id) ?
            <AbilityRequirement spell={SPELLS.SHADOW_WORD_VOID_TALENT.id} /> :
            <AbilityRequirement spell={SPELLS.MIND_BLAST.id} />}

        </Rule>

        <Rule
          name="Use cooldowns effectively"
          description={(
            <React.Fragment>
              Cooldowns are an important part of your rotation, you should be using them as often as possible.
            </React.Fragment>
          )}
        >
          {combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id) ?
            <AbilityRequirement spell={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> :
            <AbilityRequirement spell={SPELLS.SHADOWFIEND.id} />}


          {combatant.hasTalent(SPELLS.DARK_ASCENSION_TALENT.id) && (
            <AbilityRequirement spell={SPELLS.DARK_ASCENSION_TALENT.id} />
          )}
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ShadowPriestChecklist;
