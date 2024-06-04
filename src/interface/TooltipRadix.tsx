import { Arrow, Content, Portal, Root, Trigger } from '@radix-ui/react-tooltip';
import { ComponentProps, ReactNode } from 'react';

import styles from './TooltipRadix.module.scss';

export function TooltipRadix({
  children,
  content,
  side = 'bottom',
}: {
  children: ReactNode;
  content: ReactNode;
  side?: ComponentProps<typeof Content>['side'];
}) {
  return (
    <Root>
      <Trigger asChild>
        <dfn>{children}</dfn>
      </Trigger>
      <Portal>
        <Content className={styles['content']} side={side}>
          {content}
          <Arrow className={styles['arrow']} />
        </Content>
      </Portal>
    </Root>
  );
}
