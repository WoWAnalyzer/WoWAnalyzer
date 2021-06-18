import makeApiUrl from 'common/makeApiUrl';
import SPELLS from 'common/SPELLS';
import { useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json());

const useSpellInfo = (spellId: number) => {
  const { data, error } = useSWR(makeApiUrl(`spell/${spellId}`), {
    fetcher,
    isPaused: () => SPELLS[spellId] !== undefined,
  });

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (data) {
      SPELLS[spellId] = data;
    }
  }, [data, spellId]);

  return SPELLS[spellId] || data;
};

export default useSpellInfo;
