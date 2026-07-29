import { getAlertComponent } from 'interface/Alert';
import CombatLogParser from 'parser/core/CombatLogParser';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Auras';
import DistanceMoved from 'parser/shared/modules/DistanceMoved';
import { ReactNode, useMemo, useState } from 'react';
import { useConfig } from '../ConfigContext';
import { EventType } from 'parser/core/Events';
import { TimelineConfiguration } from 'interface/report/Results/Timeline/configuration/TimelineConfiguration';
import Timeline from './Timeline/Timeline';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

interface Props {
  parser: CombatLogParser;
}

const TimelineTab = ({ parser }: Props) => {
  const config = useConfig();
  const auras = parser.getModule(Buffs);
  const distanceMoved = parser.getModule(DistanceMoved);

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

  const [isMovementVisible, setIsMovementVisible] = useState<boolean>(true);
  const toggleMovementVisibility = (b: boolean) => {
    setIsMovementVisible(b);
  };

  const [spellCategoriesShown, setSpellCategoriesShown] = useState<
    Set<keyof typeof SPELL_CATEGORY>
  >(new Set(Object.values(SPELL_CATEGORY)));
  const handleSpellCategoryVisibilityChange = (
    category: keyof typeof SPELL_CATEGORY,
    visible: boolean,
  ) => {
    setSpellCategoriesShown((prev) => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(category);
      } else {
        newSet.delete(category);
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
        // this is not actually creating a new component; it is doing dynamic dispatch
        // eslint-disable-next-line react-hooks/static-components
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
      <div className="container" style={{ position: 'relative' }}>
        {alert}
        <div style={{ position: 'absolute', right: '1rem', top: '1rem', zIndex: 100 }}>
          <TimelineConfiguration
            isMovementVisible={isMovementVisible}
            onAuraVisibilityChange={handleAuraVisibilityChange}
            toggleMovementVisibility={toggleMovementVisibility}
            visibleAuras={visibleAuras}
            spellCategoriesShown={spellCategoriesShown}
            onSpellCategoryVisibilityChange={handleSpellCategoryVisibilityChange}
          />
        </div>
      </div>
      <Timeline
        parser={parser}
        abilities={parser.getModule(Abilities)}
        auras={auras}
        movement={isMovementVisible ? distanceMoved.instances : []}
        config={parser.config.timeline}
        visibleAuras={visibleAuras}
        visibleSpellCategories={spellCategoriesShown}
      />
    </>
  );
};

export default TimelineTab;
