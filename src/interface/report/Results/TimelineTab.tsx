import { getAlertComponent } from 'interface/Alert';
import CombatLogParser from 'parser/core/CombatLogParser';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Auras';
import DistanceMoved from 'parser/shared/modules/DistanceMoved';
import { ReactNode, useState, useMemo } from 'react';
import { useConfig } from '../ConfigContext';
import Component from './Timeline/Component';
import AuraConfiguration from './Timeline/AuraConfiguration';
import { EventType } from 'parser/core/Events';

interface Props {
  parser: CombatLogParser;
}

const TimelineTab = ({ parser }: Props) => {
  const config = useConfig();
  const auras = parser.getModule(Buffs);

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

  const [visibleAuras, setVisibleAuras] = useState<Set<number>>(aurasInCombatLog);

  const handleAuraVisibilityChange = (spellId: number, visible: boolean) => {
    setVisibleAuras((prev) => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(spellId);
      } else {
        newSet.delete(spellId);
      }
      return newSet;
    });
  };

  let alert: ReactNode = null;
  if (config.pages?.timeline) {
    let data;
    if (typeof config.pages?.timeline === 'function') {
      data = config.pages?.timeline(parser);
    } else {
      data = config.pages?.timeline;
    }

    if (data) {
      const Component = getAlertComponent(data.type);

      alert = (
        <Component
          style={{
            marginBottom: 30,
          }}
        >
          {data.text}
        </Component>
      );
    }
  }

  return (
    <>
      <div className="container">
        {alert}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <AuraConfiguration
            auras={auras}
            aurasInCombatLog={aurasInCombatLog}
            visibleAuras={visibleAuras}
            onAuraVisibilityChange={handleAuraVisibilityChange}
          />
        </div>
      </div>
      <Component
        parser={parser}
        abilities={parser.getModule(Abilities)}
        auras={auras}
        movement={parser.getModule(DistanceMoved).instances}
        config={parser.config.timeline}
        visibleAuras={visibleAuras}
      />
    </>
  );
};

export default TimelineTab;
