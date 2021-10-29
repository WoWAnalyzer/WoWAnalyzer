import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title: ReactNode;
  category?: STATISTIC_CATEGORY;
  position?: number;
  tooltip?: ReactNode;
};

/**
 * A statistic container for UptimeBarSubStatistics
 */
// TODO add phase dividers
const UptimeMultiBarStatistic = ({ children, title, ...others }: Props) => (
  <Statistic wide size="flexible" {...others}>
    <div className="pad">
      <div className="boring-value">
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  </Statistic>
);

export default UptimeMultiBarStatistic;
