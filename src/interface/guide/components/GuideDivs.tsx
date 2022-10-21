/**
 * Some emotion components for common containers
 */
import styled from '@emotion/styled';

/** A lighter colored panel with rounded edges */
export const RoundedPanel = styled.div`
  background: #222;
  border-radius: 0.5em;
  padding: 1em 1.5em;
  display: grid;
  grid-gap: 1rem;
  align-content: center;
  align-items: center;
`;

/** Container lays out any number of panels side-by-side and forces them to be the same width
 *  Recommend adding no more than 5 items */
export const SideBySidePanels = styled.div`
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  grid-column-gap: 1em;
`;
