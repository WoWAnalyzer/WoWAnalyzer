import React, { useEffect, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import styles from './Ad.module.scss';
import usePremium from './usePremium';

export enum Location {
  Top = 'top',
}

interface Props {
  style?: React.CSSProperties;
  location?: Location;
}

type NodeItem = HTMLDivElement | null;

const units = {
  [Location.Top]: { selectorId: 'top-banner-atf', type: 'leaderboard_atf' },
};

const Ad = ({ style, location }: Props) => {
  const { selectorId, type: adType } = units[location || Location.Top];
  const pageLoc = useLocation();
  const premium = usePremium();

  const [showBackground, setShowBackground] = useState(window.adScriptFailed);

  useEffect(() => {
    if (!premium) {
      refreshAds();

      return destroyAds;
    }
  }, [location, pageLoc.pathname, premium]);

  const initObserver = useCallback((node: NodeItem) => {
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
      style={{
        minHeight: 250,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 970,
        minWidth: 970,
        ...style,
      }}
      className={`${styles.outer_container} ${
        showBackground ? styles.show_background : ''
      } text-center`}
    >
      <div ref={initObserver} id={selectorId} data-pw-desk={adType} data-pw-mobi={adType} />
    </Link>
  );
};

export default Ad;

declare global {
  interface Window {
    tyche?: any;
    refreshAds?: () => void;
    adScriptFailed?: boolean;
  }
}

export function refreshAds() {
  const tyche = window.tyche;
  try {
    if (tyche && tyche.destroyUnits) {
      tyche.destroyUnits('all');
      tyche
        .addUnits(Object.values(units))
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

window.refreshAds = refreshAds;

export function destroyAds() {
  console.log('destroying ads');
  const destroy = window.tyche?.destroyUnits;

  if (destroy) {
    destroy('all');
  }
}
