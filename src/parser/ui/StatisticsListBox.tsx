import { TooltipElement } from 'interface';
import { CSSProperties } from 'react';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

type Props = {
  title?: React.ReactNode;
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  bodyStyle?: CSSProperties;
  category?: STATISTIC_CATEGORY;
  position?: number;
} & Omit<React.ComponentProps<'div'>, 'title'>;

/**
 * @deprecated Use `parser/ui/Statistic` instead.
 */
const StatisticsListBox = ({
  title,
  tooltip,
  children,
  bodyStyle,
  category: _category,
  position: _position,
  ...others
}: Props) => {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
      <div className="panel statistic statistic-box statistic-box-list" {...others}>
        {title && (
          <div className="panel-heading">
            <h2>{tooltip ? <TooltipElement content={tooltip}>{title}</TooltipElement> : title}</h2>
          </div>
        )}
        <div className="panel-body items" style={bodyStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default StatisticsListBox;
