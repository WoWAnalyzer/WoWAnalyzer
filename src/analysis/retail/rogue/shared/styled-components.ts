import { clsx } from 'clsx';
import { createElement, type ComponentPropsWithoutRef } from 'react';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

import styles from './styled-components.module.scss';

type RoundedPanelProps = ComponentPropsWithoutRef<typeof RoundedPanel>;

export const RoundedPanelWithBottomMargin = ({ className, ...props }: RoundedPanelProps) =>
  createElement(RoundedPanel, {
    ...props,
    className: clsx(styles.roundedPanelWithBottomMargin, className),
  });

export const ExplanationSection = ({ className, ...props }: ComponentPropsWithoutRef<'section'>) =>
  createElement('section', {
    ...props,
    className: clsx(styles.explanationSection, className),
  });
