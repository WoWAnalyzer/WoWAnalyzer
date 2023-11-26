import { useContext } from 'react';
import GuideContext from '../GuideContext';
import { GuideContextValue } from '../types';

/**
 * Get the event list from within a Guide section.
 */
export function useEvents(): GuideContextValue['events'] {
  return useContext(GuideContext).events;
}

export default useEvents;
