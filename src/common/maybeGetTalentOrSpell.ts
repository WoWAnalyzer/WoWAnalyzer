import { isClassicExpansion, RETAIL_EXPANSION } from 'game/Expansion';
import { maybeGetTalent } from 'common/TALENTS/maybeGetTalent';
import { maybeGetSpell } from 'common/SPELLS';

export const maybeGetTalentOrSpell = (
  key: string | number | undefined,
  expansion = RETAIL_EXPANSION,
) => {
  if (isClassicExpansion(expansion)) {
    return maybeGetSpell(key, expansion);
  }
  if (typeof key === 'number') {
    const talent = maybeGetTalent(key);
    if (talent) {
      return talent;
    }
  }
  return maybeGetSpell(key, expansion);
};
