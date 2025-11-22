/**
 * @module
 *
 * Design system for new UI elements. Somewhat of a WIP, talk to emallson.
 *
 * ## Levels
 *
 * The UI is constructed from stacked "layers". Each layer exists at a level:
 * level 0 is all the way at the back, and level 1 is on top of that, level 2
 * is on top of that, etc.
 *
 * ### Level 0
 *
 * The background. You generally won't use this for UI elements, unless you're doing
 * an inset within a Level 1 element.
 *
 * ### Level 1
 *
 * Example: Guide sections, Report header.
 *
 * If you're building something that floats freely on the background, use Level 1.
 *
 * ### Level 2
 *
 * Examples: buttons on level 1 elements.
 *
 * If you're adding a button, or some other element that is visually "on top of" a level 1
 * element, use a level 2 element.
 *
 * ## Colors
 *
 * This is more of a "common things we keep copying and pasting" than a system. I'd like to
 * adopt a consistent color system, but it is pretty far down the to-do list.
 *
 * ## Examples
 *
 * The new report header is a good example. See `src/interface/report/Results/Header/index.tsx`.
 *
 * ## Usage
 *
 * ```tsx
 * import styled from '@emotion/styled';
 * import * as design from 'interface/design-system';
 *
 * const Container = styled.div`
 *   border: 1px solid ${level1.border};
 *   background: ${level1.background};
 *   box-shadow: ${level1.shadow};
 * `;
 * ```
 */

export const colors = {
  bodyText: '#f3eded',
  unfocusedText: '#ccc',
  wowaYellow: '#fab700',
};

export const level0 = {
  background: '#101010',
  border: '#161616',
  shadow: '0 1px 3px black',
};

export const level1 = {
  background: '#161616',
  border: '#202020',
  shadow: '0 1px 4px black',
};

export const level2 = {
  background: '#202020',
  border: '#303030',
  shadow: '0 1px 6px #101010',

  background_active: '#252525',
};

export const gaps = {
  small: '0.5rem',
  medium: '1rem',
};
