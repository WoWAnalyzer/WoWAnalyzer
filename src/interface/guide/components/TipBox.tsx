import { ReactNode } from 'react';
import styled from '@emotion/styled';

interface TipBoxProps {
  children: ReactNode;
  icon?: ReactNode;
  title?: string;
}

/**
 * A reusable box for displaying tips, warnings, or informational messages in guides.``
 */
export function TipBox({ children, icon, title }: TipBoxProps) {
  return (
    <Container>
      <ContentWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <Content>
          {title && <strong>{title}: </strong>}
          {children}
        </Content>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 12px;
  margin-bottom: 8px;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  line-height: 1.5;
`;

const Content = styled.div`
  flex: 1;
  margin-bottom: 0;
  line-height: 1.5;
`;

interface TipBoxWithTimestampsProps extends TipBoxProps {
  timestamps: number[];
  formatTimestamp: (timestamp: number) => string;
  maxTimestamps?: number;
}

/**
 * TipBox variant that includes affected timestamps
 */
export function TipBoxWithTimestamps({
  children,
  timestamps,
  formatTimestamp,
  maxTimestamps = 5,
  ...props
}: TipBoxWithTimestampsProps) {
  return (
    <TipBox {...props}>
      <div>
        {children}
        {timestamps && timestamps.length > 0 && (
          <TimestampsList>
            <strong>Affected casts:</strong>{' '}
            {timestamps
              .slice(0, maxTimestamps)
              .map((ts) => formatTimestamp(ts))
              .join(', ')}
            {timestamps.length > maxTimestamps && ` (+${timestamps.length - maxTimestamps} more)`}
          </TimestampsList>
        )}
      </div>
    </TipBox>
  );
}

const TimestampsList = styled.div`
  margin-top: 8px;
  font-size: 0.9em;
  opacity: 0.8;
`;
