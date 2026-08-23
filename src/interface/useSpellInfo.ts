import type Spell from 'common/SPELLS/Spell';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { useExpansionContext } from 'interface/report/ExpansionContext';

/**
 * Static builds resolve spell metadata only from the bundled spell/talent catalog.
 * Callers already render a deterministic unknown-spell label and icon when this returns undefined.
 */
const useSpellInfo = (spell: number | Spell | undefined) => {
  const { expansion } = useExpansionContext();
  return typeof spell === 'number' ? maybeGetTalentOrSpell(spell, expansion) : spell;
};

export default useSpellInfo;
