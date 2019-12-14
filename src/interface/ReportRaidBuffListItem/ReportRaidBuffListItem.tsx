import React from 'react';

import Icon from 'common/Icon';

interface Props {
  icon: string;
  count: number;
}

const ReportRaidBuffListItem = ({ icon, count }: Props) => (
  <div className="panel">
    <Icon icon={icon} className="icon" />
    <div className="count">{count}</div>
  </div>
);

export default ReportRaidBuffListItem;
