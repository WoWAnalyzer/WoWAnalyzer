import { useMemo } from 'react';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import SpellLink from 'interface/SpellLink';
import { EventType } from 'parser/core/Events';
import Buffs from 'parser/core/modules/Auras';

import styles from './AuraConfiguration.module.scss';

export interface AuraConfigurationProps {
  visibleAuras: Set<number>;
  onAuraVisibilityChange: (spellId: number, visible: boolean) => void;
}
export const AuraConfiguration = ({
  visibleAuras,
  onAuraVisibilityChange,
}: AuraConfigurationProps) => {
  const { combatLogParser: parser } = useCombatLogParser();
  const auras = useMemo(() => parser.getModule(Buffs), [parser]);

  const aurasInCombatLog = useMemo(() => {
    const aurasSet = new Set<number>();

    parser.eventHistory.forEach((event) => {
      if (event.type === EventType.ApplyBuff || event.type === EventType.RemoveBuff) {
        const spellId = event.ability.guid;
        const buff = auras.getAura(spellId);
        if (buff && buff.timelineHighlight) {
          aurasSet.add(spellId);
        }
      }
    });

    return aurasSet;
  }, [parser.eventHistory, auras]);

  const getDisplayableAuras = (): number[] => {
    const displayableAuras: number[] = [];

    aurasInCombatLog.forEach((spellId) => {
      const aura = auras.getAura(spellId);
      if (!aura || !aura.timelineHighlight) {
        return;
      }

      displayableAuras.push(spellId);
    });

    return displayableAuras;
  };

  const displayableAuras = getDisplayableAuras();

  const toggleAll = (visible: boolean) => {
    displayableAuras.forEach((spellId) => {
      onAuraVisibilityChange(spellId, visible);
    });
  };

  return (
    <>
      <div className={styles['aura-config-header']}>
        <h4>Buffs</h4>
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
        {displayableAuras.length === 0 ? (
          <div className="aura-config-empty">No timeline auras available</div>
        ) : (
          displayableAuras
            .map((spellId) => maybeGetTalentOrSpell(spellId)!)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((spell) => (
              <label key={spell.id} className={styles['aura-config-item']}>
                <input
                  type="checkbox"
                  checked={visibleAuras.has(spell.id)}
                  onChange={(e) => onAuraVisibilityChange(spell.id, e.target.checked)}
                />
                <SpellLink spell={spell} className={styles['aura-config-spell-link']} />
              </label>
            ))
        )}
      </div>
    </>
  );
};
