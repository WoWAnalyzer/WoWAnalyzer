import { ReactNode } from 'react';

import styles from './TimelineConfiguration.module.scss';

interface ConfigurationSectionProps<T extends number | string> {
  title: string;
  items: T[];
  visibleItems: Set<T>;
  onVisibilityChange: (item: T, visible: boolean) => void;
  renderLabel: (item: T) => ReactNode;
  emptyText?: string;
}
export const ConfigurationSection = <T extends number | string>({
  title,
  items,
  visibleItems,
  onVisibilityChange,
  renderLabel,
  emptyText,
}: ConfigurationSectionProps<T>) => {
  const toggleAll = (visible: boolean) => {
    items.forEach((item) => onVisibilityChange(item, visible));
  };

  return (
    <section>
      <div className={styles['section-header']}>
        <h4>
          {title}
          <span className={styles['section-count']}>
            {items.filter((item) => visibleItems.has(item)).length}/{items.length}
          </span>
        </h4>
        <div className={styles['section-controls']}>
          <button type="button" onClick={() => toggleAll(true)}>
            All
          </button>
          <span aria-hidden>·</span>
          <button type="button" onClick={() => toggleAll(false)}>
            None
          </button>
        </div>
      </div>
      {items.length === 0 && emptyText ? (
        <div className={styles['empty']}>{emptyText}</div>
      ) : (
        items.map((item) => (
          <label
            key={item}
            className={styles['item']}
            onClick={(e) => {
              if (e.target instanceof Element && e.target.closest('a')) {
                e.preventDefault();
                onVisibilityChange(item, !visibleItems.has(item));
              }
            }}
          >
            <input
              type="checkbox"
              checked={visibleItems.has(item)}
              onChange={(e) => onVisibilityChange(item, e.target.checked)}
            />
            {renderLabel(item)}
          </label>
        ))
      )}
    </section>
  );
};
