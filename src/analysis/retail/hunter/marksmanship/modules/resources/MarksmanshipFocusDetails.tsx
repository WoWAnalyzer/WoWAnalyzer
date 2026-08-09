import type { JSX } from 'react';
import FocusDetails from 'analysis/retail/hunter/shared/FocusDetails';

/**
 * Focus generation isn't a meaningful constraint on Marksmanship's rotation, so the
 * shared "Wasted generator Focus" statistic tile isn't worth surfacing here. The Focus
 * breakdown tab is still useful, so only the statistic is suppressed.
 */
class MarksmanshipFocusDetails extends FocusDetails {
  statistic(): JSX.Element | null {
    return null;
  }
}

export default MarksmanshipFocusDetails;
