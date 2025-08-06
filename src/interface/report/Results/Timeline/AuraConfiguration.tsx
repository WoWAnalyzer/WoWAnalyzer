import { useState, useRef, useEffect } from 'react';
import Tooltip from 'interface/Tooltip';
import CogIcon from 'interface/icons/Cog';
import AurasModule from 'parser/core/modules/Auras';
import './AuraConfiguration.scss';
import SpellLink from 'interface/SpellLink';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

interface Props {
  auras: AurasModule;
  aurasInCombatLog: Set<number>;
  visibleAuras: Set<number>;
  onAuraVisibilityChange: (spellId: number, visible: boolean) => void;
}

const AuraConfiguration = ({
  auras,
  aurasInCombatLog,
  visibleAuras,
  onAuraVisibilityChange,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    <div className="aura-configuration" ref={menuRef}>
      <Tooltip content="Configure visible auras">
        <button
          type="button"
          className="aura-config-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Configure aura visibility"
        >
          <CogIcon />
        </button>
      </Tooltip>

      {isOpen && (
        <div className="aura-config-menu">
          <div className="aura-config-header">
            <h4>Buffs</h4>
            <div className="aura-config-controls">
              <button
                type="button"
                className="btn btn-sm btn-default"
                onClick={() => toggleAll(true)}
              >
                Show All
              </button>
              <button
                type="button"
                className="btn btn-sm btn-default"
                onClick={() => toggleAll(false)}
              >
                Hide All
              </button>
            </div>
          </div>

          <div className="aura-config-list">
            {displayableAuras.length === 0 ? (
              <div className="aura-config-empty">No timeline auras available</div>
            ) : (
              displayableAuras
                .map((spellId) => maybeGetTalentOrSpell(spellId)!)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((spell) => (
                  <label key={spell.id} className="aura-config-item">
                    <input
                      type="checkbox"
                      checked={visibleAuras.has(spell.id)}
                      onChange={(e) => onAuraVisibilityChange(spell.id, e.target.checked)}
                    />
                    <SpellLink spell={spell} className="aura-config-spell-link" />
                  </label>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraConfiguration;
