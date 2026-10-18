import { useMemo } from 'react';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import SpellLink from 'interface/SpellLink';
import { EventType } from 'parser/core/Events';
import Buffs from 'parser/core/modules/Auras';

import { ConfigurationSection } from './ConfigurationSection';

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

  const displayableAuras = [...aurasInCombatLog].sort((a, b) =>
    (maybeGetTalentOrSpell(a)?.name ?? '').localeCompare(maybeGetTalentOrSpell(b)?.name ?? ''),
  );

  return (
    <ConfigurationSection
      title="Buffs"
      items={displayableAuras}
      visibleItems={visibleAuras}
      onVisibilityChange={onAuraVisibilityChange}
      renderLabel={(spellId) => <SpellLink spell={maybeGetTalentOrSpell(spellId) ?? spellId} />}
      emptyText="No timeline auras available"
    />
  );
};
