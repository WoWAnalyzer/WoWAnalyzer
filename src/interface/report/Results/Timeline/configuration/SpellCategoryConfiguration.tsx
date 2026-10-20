import { useMemo } from 'react';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { EventType } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY, { getSpellCategoryName } from 'parser/core/SPELL_CATEGORY';

import { isCooldownLaneCastEvent } from '../Timeline';
import { ConfigurationSection } from './ConfigurationSection';

export interface SpellCategoryConfigurationProps {
  spellCategoriesShown: Set<keyof typeof SPELL_CATEGORY>;
  onSpellCategoryVisibilityChange: (
    category: keyof typeof SPELL_CATEGORY,
    visible: boolean,
  ) => void;
}

export const SpellCategoryConfiguration = ({
  spellCategoriesShown,
  onSpellCategoryVisibilityChange,
}: SpellCategoryConfigurationProps) => {
  const { combatLogParser: parser } = useCombatLogParser();

  // Categories with at least one cooldown lane on the timeline, in SPELL_CATEGORY order.
  const spellCategories = useMemo(() => {
    const abilities = parser.getModule(Abilities);
    const categories = new Set<keyof typeof SPELL_CATEGORY | null>();
    parser.eventHistory.forEach((event) => {
      if (
        (event.type === EventType.Cast || event.type === EventType.FilterCooldownInfo) &&
        isCooldownLaneCastEvent(event, parser, abilities)
      ) {
        categories.add(abilities.getAbility(event.ability.guid)!.category);
      }
    });
    return (Object.keys(SPELL_CATEGORY) as (keyof typeof SPELL_CATEGORY)[]).filter((category) =>
      categories.has(category),
    );
  }, [parser]);

  return (
    <ConfigurationSection
      title="Spell Categories"
      items={spellCategories}
      visibleItems={spellCategoriesShown}
      onVisibilityChange={onSpellCategoryVisibilityChange}
      renderLabel={getSpellCategoryName}
    />
  );
};
