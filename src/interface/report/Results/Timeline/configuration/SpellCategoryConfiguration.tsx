import styles from 'interface/report/Results/Timeline/configuration/AuraConfiguration.module.scss';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

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
  const toggleAll = (visible: boolean) => {
    Object.values(SPELL_CATEGORY).forEach((category) => {
      onSpellCategoryVisibilityChange(category, visible);
    });
  };

  return (
    <>
      <div className={styles['aura-config-header']}>
        <h4>Spell Categories</h4>
        <div className={styles['aura-config-controls']}>
          <button type="button" className="btn btn-sm btn-default" onClick={() => toggleAll(true)}>
            Show All
          </button>
          <button type="button" className="btn btn-sm btn-default" onClick={() => toggleAll(false)}>
            Hide All
          </button>
        </div>
      </div>
      <div className={styles['aura-config-list']}>
        {Object.entries(SPELL_CATEGORY).map(([category, displayName]) => {
          const removeUnderline = displayName.split('_').join(' ');
          const formattedName = removeUnderline.charAt(0) + removeUnderline.slice(1).toLowerCase();
          return (
            <label key={category} className={styles['aura-config-item']}>
              <input
                type="checkbox"
                checked={spellCategoriesShown.has(category as keyof typeof SPELL_CATEGORY)}
                onChange={(e) =>
                  onSpellCategoryVisibilityChange(
                    category as keyof typeof SPELL_CATEGORY,
                    e.target.checked,
                  )
                }
              />
              {formattedName}
            </label>
          );
        })}
      </div>
    </>
  );
};
