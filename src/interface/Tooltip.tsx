import { CSSProperties, ReactNode } from 'react';

import ReactTooltip, { TooltipProps as ReactTooltipProps } from '@wowanalyzer/react-tooltip-lite';

import './Tooltip.scss';

interface TooltipProps extends ReactTooltipProps {
  /**
   * REQUIRED: The text/element that triggers the tooltip
   */
  children: ReactNode;
  /**
   * Boolean which states, if a person can access the tooltip contents (and click links, select and copy text etc.)
   * Default: false
   */
  hoverable?: boolean;
}
const Tooltip = ({
  content,
  children,
  className = '',
  direction = 'down',
  hoverable = false,
  ...others
}: TooltipProps) => {
  return (
    <ReactTooltip
      {...others}
      className={className}
      direction={direction}
      tipContentHover={hoverable}
      content={content}
    >
      {children}
    </ReactTooltip>
  );
};
export default Tooltip;

interface TooltipElementProps extends TooltipProps {
  style?: CSSProperties;
  tooltipClassName?: string;
}
export const TooltipElement = ({
  content,
  children,
  className = '',
  direction = 'down',
  hoverable = false,
  style = {},
  tooltipClassName = '',
  ...others
}: TooltipElementProps) => {
  return (
    <ReactTooltip
      {...others}
      content={content}
      className={tooltipClassName}
      direction={direction}
      tipContentHover={hoverable}
    >
      <dfn className={className} style={style}>
        {children}
      </dfn>
    </ReactTooltip>
  );
};
