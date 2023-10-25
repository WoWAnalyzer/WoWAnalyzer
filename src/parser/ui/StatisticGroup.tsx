import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

type Props = React.PropsWithChildren<{
  large?: boolean;
  wide?: boolean;
  style?: React.CSSProperties;
  category?: STATISTIC_CATEGORY;
  position?: number;
}>;

const StatisticGroup = ({ children, large, wide, style, ...others }: Props) => (
  <div
    className={wide ? 'col-md-6 col-sm-12 col-xs-12' : 'col-lg-3 col-md-4 col-sm-6 col-xs-12'}
    style={{ padding: 0, ...style }}
    {...others}
  >
    {children}
  </div>
);

export default StatisticGroup;
