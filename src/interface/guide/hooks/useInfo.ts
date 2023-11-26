import { useContext } from 'react';
import GuideContext from '../GuideContext';
import { GuideContextValue } from '../types';

/**
 * Get the player `Info` object from within a Guide section.
 */
function useInfo(): GuideContextValue['info'] {
  return useContext(GuideContext).info;
}

export default useInfo;
