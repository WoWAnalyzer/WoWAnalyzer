import React from 'react';

import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import './Statistic.scss';
import './StatisticBar.scss';

type Props = {
  children: React.ReactNode;
  category?: STATISTIC_CATEGORY;
  position?: number;

  large?: boolean;
  wide?: boolean;
  ultrawide?: boolean;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const StatisticBar = ({ children, large, wide, ultrawide, ...others }: Props) => (
  <div
    className={
      ultrawide
        ? 'col-md-12'
        : wide
        ? 'col-md-6 col-sm-12 col-xs-12'
        : 'col-lg-3 col-md-4 col-sm-6 col-xs-12'
    }
  >
    <div className="panel statistic bar" {...others}>
      <div className="panel-body">{children}</div>
    </div>
  </div>
);

export default StatisticBar;
