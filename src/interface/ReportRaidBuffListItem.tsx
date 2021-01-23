import React from 'react';

import SpellIcon from 'interface/SpellIcon';

interface Props {
  spellId: number;
  count: number;
}

const ReportRaidBuffListItem = ({ spellId, count }: Props) => (
  <div className={`panel ${count > 0 ? 'available' : 'unavailable'}`}>
    <SpellIcon id={spellId} />
    <div className="count">{count}</div>
  </div>
);

export default ReportRaidBuffListItem;
