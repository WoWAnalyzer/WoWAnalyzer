import styled from '@emotion/styled';

/**
 * An inline text highlight. Like using the highlight functionality in Word or Docs.
 *
 * Or like using a highlighter, I guess.
 */
export const Highlight = styled.span<{ color: string; textColor?: string }>`
  background-color: ${(props) => props.color};
  padding: 0 3px;
  ${(props) => (props.textColor ? `color: ${props.textColor};` : '')}
  box-decoration-break: clone;
`;
