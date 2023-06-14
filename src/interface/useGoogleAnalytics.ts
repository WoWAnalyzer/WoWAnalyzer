import { useContext, useEffect } from 'react';
import ConfigContext from './report/ConfigContext';
import FightCtx from './report/context/FightContext';

interface PageViewProperties {
  page_title: string;
  page_location: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag(kind: 'event', eventType: 'page_view', eventParams: PageViewProperties): void;
    gtag(kind: string, eventType: string, eventParams: Record<string, unknown>): void;
  }
}

export function usePageView(componentName: string, key?: unknown) {
  const config = useContext(ConfigContext);
  const fight = useContext(FightCtx);
  useEffect(() => {
    const props = {
      page_title: document.title,
      page_location: window.location.href,
      component_name: componentName,
      component_view_key: key,
      player_class: config?.spec.className,
      player_spec: config?.spec.specName,
      fight_is_dungeon: fight?.fight.dungeonPulls !== undefined,
      fight_difficulty: fight?.fight.difficulty,
      fight_boss: fight?.fight.boss,
    };
    console.info('page view', props, componentName);
    window.gtag('event', 'page_view', props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
