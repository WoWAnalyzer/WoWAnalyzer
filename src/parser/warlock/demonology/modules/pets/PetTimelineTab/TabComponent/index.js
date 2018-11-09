import React from 'react';

import Tab from 'interface/others/Tab';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import PetTimeline from './PetTimeline';

class TimelineTab extends React.PureComponent {
  render() {
    return (
      <Tab style={{ padding: '10px 22px 0' }}>
        <div className="text-muted">
          This timeline shows the pets you have summoned over the fight, together with key spell casts like <SpellLink id={SPELLS.NETHER_PORTAL_TALENT.id} />, <SpellLink id={SPELLS.IMPLOSION_CAST.id} /> or <SpellLink id={SPELLS.SUMMON_DEMONIC_TYRANT.id} />.
        </div>
        <PetTimeline
          {...this.props}
          style={{
            marginTop: 10,
            marginLeft: -22,
            marginRight: -22,
          }}
        />
      </Tab>
    );
  }
}

export default TimelineTab;
