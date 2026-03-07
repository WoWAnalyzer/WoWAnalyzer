import styled from '@emotion/styled';
import * as design from 'interface/design-system';

const Button = styled.button`
  appearance: none;
  border: none;
  box-shadow: ${design.level2.shadow};
  background: ${design.level2.background};
  border: 1px solid ${design.level2.border};
  border-radius: 0.5rem;
  padding: 0 1rem;

  &:hover {
    filter: brightness(115%);
  }
`;

export default Button;
