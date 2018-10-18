import React from 'react';
import PropTypes from 'prop-types';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import SPELLS from 'common/SPELLS';

class EnhancementShamanChecklist extends React.PureComponent {
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

    return (
      <Checklist>
        <Rule
          name="Always be casting"
          description={(
            <>
              You should try to avoid doing nothing during the fight. If you have to move, try casting something instant with range like <SpellLink id={SPELLS.FLAMETONGUE.id} /> or <SpellLink id={SPELLS.ROCKBITER.id} />
            </>
          )} />
      </Checklist>
    );
  }
}