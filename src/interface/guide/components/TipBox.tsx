import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { CheckmarkIcon, CrossIcon, InformationIcon, NoteIcon, WarningIcon } from 'interface/icons';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';

export type TipBoxType = 'info' | 'note' | 'success' | 'warning' | 'error';

interface TipBoxProps {
  children: ReactNode;
  icon?: ReactNode;
  title?: string;
  type?: TipBoxType;
  hideIcon?: boolean;
}

interface VariantStyle {
  color: string;
  defaultIcon?: ReactNode;
  defaultTitle?: string;
}

function getVariantStyle(type: TipBoxType): VariantStyle {
  switch (type) {
    case 'note':
      return { color: '#a78bfa', defaultIcon: <NoteIcon /> };
    case 'success':
      return { color: '#4ec04e', defaultIcon: <CheckmarkIcon />, defaultTitle: 'Success' };
    case 'warning':
      return { color: '#f59e0b', defaultIcon: <WarningIcon />, defaultTitle: 'Warning' };
    case 'error':
      return { color: '#dc2626', defaultIcon: <CrossIcon />, defaultTitle: 'Error' };
    case 'info':
    default:
      return { color: '#3b82f6', defaultIcon: <InformationIcon /> };
  }
}

/**
 * A reusable box for displaying tips, warnings, or informational messages in guides.
 *
 * Use the `type` prop to control the color theme and default icon/title:
 * - `'info'` (default) — blue, information icon
 * - `'note'` — purple, sticky note icon (for secondary/contextual content)
 * - `'success'` — green, checkmark icon, "Success" title
 * - `'warning'` — amber, warning triangle icon, "Warning" title
 * - `'error'` — red, cross icon, "Error" title
 *
 * For performance-driven boxes, use `PerformanceTipBox` instead.
 */
export function TipBox({ children, icon, title, type = 'info', hideIcon = false }: TipBoxProps) {
  const { color, defaultIcon, defaultTitle } = getVariantStyle(type);
  const resolvedIcon = hideIcon ? undefined : (icon ?? defaultIcon);
  const resolvedTitle = title ?? defaultTitle;
  const role = type === 'warning' || type === 'error' ? 'alert' : 'note';

  return (
    <TipBoxLayout color={color} role={role} icon={resolvedIcon} title={resolvedTitle}>
      {children}
    </TipBoxLayout>
  );
}

function TipBoxLayout({
  color,
  role,
  icon,
  title,
  children,
}: {
  color: string;
  role: string;
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
}) {
  const hasHeader = icon || title;
  return (
    <Container $color={color} role={role}>
      <Content>
        {hasHeader && (
          <TitleWrapper $color={color}>
            <strong>
              {icon && <IconWrapper>{icon}</IconWrapper>}
              {title && <>{title}: </>}
            </strong>
          </TitleWrapper>
        )}
        {children}
      </Content>
    </Container>
  );
}

const Container = styled.div<{ $color: string }>`
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid ${(p) => p.$color}66;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 12px;
  margin-bottom: 8px;
`;

const TitleWrapper = styled.span<{ $color: string }>`
  color: ${(p) => p.$color};
`;

const IconWrapper = styled.span`
  display: inline-block;
  vertical-align: -0.1em;
  line-height: 1;
  margin-right: 0.4em;
  font-size: 1.4em;

  & > svg,
  & > img {
    width: 1em;
    height: 1em;
  }
`;

const Content = styled.div`
  line-height: 1.5;
`;

interface PerformanceTipBoxProps extends Omit<TipBoxProps, 'type'> {
  performance: QualitativePerformance;
}

/**
 * A TipBox whose color and icon are driven by a `QualitativePerformance` value.
 * Use this for analyzer-generated feedback boxes.
 */
const PERFORMANCE_COLORS: Record<QualitativePerformance, string> = {
  [QualitativePerformance.Perfect]: '#2090c0',
  [QualitativePerformance.Good]: '#4ec04e',
  [QualitativePerformance.Ok]: '#ffc84a',
  [QualitativePerformance.Fail]: '#ac1f39',
};

export function PerformanceTipBox({
  children,
  performance,
  title,
  icon,
  hideIcon = false,
}: PerformanceTipBoxProps) {
  const color = PERFORMANCE_COLORS[performance];
  const resolvedIcon = hideIcon ? undefined : (icon ?? <PerformanceMark perf={performance} />);
  const role = performance === QualitativePerformance.Fail ? 'alert' : 'note';

  return (
    <TipBoxLayout color={color} role={role} icon={resolvedIcon} title={title}>
      {children}
    </TipBoxLayout>
  );
}
