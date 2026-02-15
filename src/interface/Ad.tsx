import type { CSSProperties } from 'react';
import { useEffect, useCallback, useState, Component, ReactNode, ErrorInfo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { captureException } from 'common/errorLogger';

import styles from './Ad.module.scss';
import usePremium from './usePremium';

export enum Location {
  Top = 'top',
  SideRail = 'side-rail',
}

interface Props {
  style?: CSSProperties;
  location?: Location;
}

const units = {
  [Location.Top]: { selectorId: 'top-banner-atf', type: 'leaderboard_atf' },
  [Location.SideRail]: { selectorId: 'vertical-banner-atf', type: 'med_rect_atf' },
};

interface Unit {
  selectorId: string;
  type: string;
}

const activeUnits = new Set();

const Ad = ({ style, location }: Props) => {
  const { selectorId, type: adType } = units[location ?? Location.Top];
  const pageLoc = useLocation();
  const premium = usePremium();

  const [showBackground, setShowBackground] = useState(window.adScriptFailed);

  useEffect(() => {
    if (location) {
      activeUnits.add(location);
      return () => activeUnits.delete(location);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, [location]);

  useEffect(() => {
    if (!premium) {
      refreshAds([units[location ?? Location.Top]]);

      return destroyAds;
    }
  }, [location, pageLoc.pathname, premium]);

  const initObserver = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }

    const observer = new MutationObserver((mutationList) => {
      const target = mutationList[0].target;
      const hasDisplayNone = window.getComputedStyle(target as Element).display === 'none';
      setShowBackground(hasDisplayNone || !target.hasChildNodes());
    });

    observer.observe(node, {
      attributes: true,
      childList: true,
      attributeFilter: ['style'],
    });
  }, []);

  if (premium) {
    return null;
  }

  return (
    <Link
      to="/premium"
      style={style}
      className={`${styles.outer_container} ${location ? styles[location] : ''} ${
        showBackground ? styles.show_background : ''
      } text-center`}
    >
      <div className={styles.ad_label}>Advertisement</div>
      <div ref={initObserver} id={selectorId} data-pw-desk={adType} data-pw-mobi={adType} />
    </Link>
  );
};

export default Ad;

declare global {
  interface Window {
    // ad script stuff that we don't control. don't try to type it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tyche?: any;
    refreshAds?: () => void;
    adScriptFailed?: boolean;
  }
}

function refreshAds(units: Unit[]) {
  const tyche = window.tyche;
  try {
    if (tyche && tyche.destroyUnits) {
      tyche.destroyUnits('all');
      tyche
        .addUnits(units)
        .then(() => {
          console.log('ads refreshed');
          tyche.displayUnits();
        })
        .catch((e: Error) => {
          tyche.displayUnits();
          console.log('displayUnits error: ', e);
        });
    }
  } catch (e) {
    console.log('failed to refresh ads:', e);
  }
}

function externalRefreshAds() {
  refreshAds(
    Object.keys(units)
      .filter((loc) => activeUnits.has(loc))
      .map((loc) => units[loc as Location]),
  );
}

window.refreshAds = externalRefreshAds;

function destroyAds() {
  console.log('destroying ads');
  const destroy = window.tyche?.destroyUnits;

  if (destroy) {
    destroy('all');
  }
}

interface AdErrorBoundaryProps {
  children: ReactNode;
}
interface AdErrorBoundaryState {
  hasError: boolean;
}
// Error Boundaries must be written as class components
export class AdErrorBoundary extends Component<AdErrorBoundaryProps, AdErrorBoundaryState> {
  public state: AdErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): AdErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error);
  }

  public render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
