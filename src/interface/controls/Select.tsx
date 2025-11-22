import styled from '@emotion/styled';
import * as design from 'interface/design-system';

const Select = styled.select`
  background: ${design.level2.background};
  border: 1px solid ${design.level2.border};
  box-shadow: ${design.level2.shadow};
  border-radius: 0.5rem;
  padding: ${design.gaps.small} ${design.gaps.medium};

  color: ${design.colors.bodyText};
  cursor: pointer;
`;

export default Select;
