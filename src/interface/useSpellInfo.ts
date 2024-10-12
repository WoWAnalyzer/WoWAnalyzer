import { captureException } from '@sentry/react';
import makeApiUrl from 'common/makeApiUrl';
import SPELLS from 'common/SPELLS';
import { useEffect } from 'react';
import useSWR from 'swr';
import Spell from 'common/SPELLS/Spell';
import { useExpansionContext } from 'interface/report/ExpansionContext';
import { getSpellId } from 'common/getSpellId';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json());

const useSpellInfo = (spell: number | Spell | undefined) => {
  const { expansion } = useExpansionContext();
  const spellId = spell ? getSpellId(spell) : null;
  const argumentAsSpell =
    typeof spell === 'number' ? maybeGetTalentOrSpell(spell, expansion) : spell;

  const { data, error } = useSWR<Spell>(spellId ? makeApiUrl(`spell/${spellId}`) : null, {
    fetcher,
    isPaused: () => argumentAsSpell !== undefined,
  });

  useEffect(() => {
    if (spellId && data) {
      SPELLS[spellId] = data;
    }
  }, [data, spellId]);

  if (error) {
    captureException(error);
    console.error(error);
    return argumentAsSpell;
  }

  return argumentAsSpell ?? data;
};

export default useSpellInfo;
