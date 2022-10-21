import makeApiUrl from 'common/makeApiUrl';
import SPELLS, { maybeGetSpell } from 'common/SPELLS';
import { useEffect } from 'react';
import useSWR from 'swr';
import Spell from 'common/SPELLS/Spell';

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json());

const useSpellInfo = (spell: number | Spell) => {
  const spellId = typeof spell === 'number' ? spell : spell.id;
  const argumentAsSpell = typeof spell === 'number' ? maybeGetSpell(spellId) : spell;

  const { data, error } = useSWR(makeApiUrl(`spell/${spellId}`), {
    fetcher,
    isPaused: () => argumentAsSpell !== undefined,
  });

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (data) {
      SPELLS[spellId] = data;
    }
  }, [data, spellId]);

  return argumentAsSpell ?? data;
};

export default useSpellInfo;
