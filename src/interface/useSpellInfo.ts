import makeApiUrl from 'common/makeApiUrl';
import SPELLS from 'common/SPELLS';
import { useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json());

const useSpellInfo = (spellId: number) => {
  if (SPELLS[spellId]) {
    return SPELLS[spellId];
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, error } = useSWR(makeApiUrl(`spell/${spellId}`), fetcher);

  if (error) {
    throw error;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (data) {
      SPELLS[spellId] = data;
    }
  }, [data, spellId]);

  return data;
};

export default useSpellInfo;
