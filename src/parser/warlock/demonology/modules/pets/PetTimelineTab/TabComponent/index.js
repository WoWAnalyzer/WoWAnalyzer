import React from 'react';
import PropTypes from 'prop-types';

import { Panel } from 'interface';

import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

import PetTimeline from './PetTimeline';

const TimelineTab = props => {
  const { selectedCombatant } = props;
  return (
    <Panel style={{ padding: '10px 22px 0' }}>
      <div className="text-muted">
        This timeline shows the pets you have summoned over the fight, together with key spell casts like {selectedCombatant.hasTalent(SPELLS.POWER_SIPHON_TALENT.id) && <><SpellLink id={SPELLS.POWER_SIPHON_TALENT.id} />, </>}{selectedCombatant.hasTalent(SPELLS.NETHER_PORTAL_TALENT.id) && <><SpellLink id={SPELLS.NETHER_PORTAL_TALENT.id} />, </>}<SpellLink id={SPELLS.IMPLOSION_CAST.id} /> or <SpellLink id={SPELLS.SUMMON_DEMONIC_TYRANT.id} />.
      </div>
      <PetTimeline
        {...props}
        style={{
          marginTop: 10,
          marginLeft: -22,
          marginRight: -22,
        }}
      />
    </Panel>
  );
};

TimelineTab.propTypes = {
  selectedCombatant: PropTypes.object,
};

export default TimelineTab;
