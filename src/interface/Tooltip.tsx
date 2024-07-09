import { Arrow, Content, Portal, Root, Trigger } from '@radix-ui/react-tooltip';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import styles from './Tooltip.module.scss';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  isOpen?: boolean;
  side?: ComponentProps<typeof Content>['side'];
}
export function Tooltip({ children, content, isOpen, side = 'bottom' }: TooltipProps) {
  return (
    <Root open={isOpen}>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content className={styles['content']} side={side}>
          {content}
          <Arrow className={styles['arrow']} />
        </Content>
      </Portal>
    </Root>
  );
}
export default Tooltip;

interface TooltipElementProps extends TooltipProps {
  className?: string;
  style?: CSSProperties;
  tooltipClassName?: string;
}
export const TooltipElement = ({
  content,
  children,
  className = '',
  side = 'bottom',
  style = {},
  tooltipClassName = '',
  ...others
}: TooltipElementProps) => {
  return (
    <Root>
      <Trigger asChild>
        <dfn className={className} style={style}>
          {children}
        </dfn>
      </Trigger>
      <Portal>
        <Content
          className={[styles['content'], tooltipClassName].filter((it) => it).join(' ')}
          side={side}
        >
          {content}
          <Arrow className={styles['arrow']} />
        </Content>
      </Portal>
    </Root>
  );
};

type MaybeTooltipProps = Partial<Pick<TooltipElementProps, 'content'>> &
  Omit<TooltipElementProps, 'content'>;

export const MaybeTooltip = ({ content, children, ...rest }: MaybeTooltipProps) => {
  if (content) {
    return (
      <TooltipElement content={content} {...rest}>
        {children}
      </TooltipElement>
    );
  }
  return <>{children}</>;
};
