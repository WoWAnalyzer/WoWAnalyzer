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
  grid-gap: 2rem;
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

/** Container for 2 divs - first is narrow and on the left, second is wide and on the right */
export const NarrowWideColumns = styled.div`
  display: grid;
  grid-template-columns: 30% 1fr;
  grid-column-gap: 1em;
`;
