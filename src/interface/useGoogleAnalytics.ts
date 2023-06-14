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

/**
 * This hook triggers a page view on Google Analytics when called.
 *
 * It will trigger at most one page view per component lifetime unless the `key` parameter is set.
 *
 * Setting the `key` parameter allows triggering page view events when the `key` changes. This is
 * useful if you have a containing component like `DefaultTab` that may represent multiple logical pages.
 *
 * We use this rather than tying into the router or `window.location` in order to use spec and fight context
 * to add extra tags to the page view event.
 */
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
    if (window.gtag) {
      window.gtag('event', 'page_view', props);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
