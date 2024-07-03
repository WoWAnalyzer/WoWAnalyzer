import styled from '@emotion/styled';
import { OkMark } from '../index';

const BadgeContainer = styled.span`
  white-space: nowrap;
  background: #2b2b2b;
  border-radius: 0.3em;
  padding: 0 0.4em;
  line-height: 1.8em;
  display: inline-flex;
  align-items: baseline;
  flex-direction: row;
  gap: 0.25em;

  & i {
    top: 2px;
  }
`;

export default function FoundationSupportBadge(): JSX.Element {
  return (
    <BadgeContainer>
      <OkMark /> Foundational Support
    </BadgeContainer>
  );
}
