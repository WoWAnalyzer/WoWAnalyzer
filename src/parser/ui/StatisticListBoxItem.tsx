import type { ReactNode } from 'react';
import { TooltipElement } from 'interface';

interface Props {
  title: ReactNode;
  value: ReactNode;
  titleTooltip?: ReactNode;
  valueTooltip?: ReactNode;
}

/**
 * @deprecated Use `parser/ui/Statistic` instead.
 */
const StatisticListBoxItem = ({ title, value, titleTooltip, valueTooltip }: Props) => (
  <div className="flex">
    <div className="flex-main">
      {titleTooltip ? <TooltipElement content={titleTooltip}>{title}</TooltipElement> : title}
    </div>
    <div className="flex-sub text-right">
      {valueTooltip ? <TooltipElement content={valueTooltip}>{value}</TooltipElement> : value}
    </div>
  </div>
);

export default StatisticListBoxItem;
