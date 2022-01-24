import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './Ad.scss';
import usePremium from './usePremium';

export enum Location {
  Top = 'top',
}

interface Props {
  style?: React.CSSProperties;
  location?: Location;
}

const units = {
  [Location.Top]: { selectorId: 'top-banner-atf', type: 'leaderboard_atf' },
};

const Ad = ({ style, location }: Props) => {
  const { selectorId, type: adType } = units[location || Location.Top];
  const pageLoc = useLocation();
  const premium = usePremium();

  useEffect(() => {
    if (!premium) {
      refreshAds();

      return destroyAds;
    }
  }, [location, pageLoc.pathname, premium]);

  if (premium) {
    return null;
  }

  return (
    <div
      id={selectorId}
      className="display-ad text-center"
      style={{ minHeight: 250, ...style }}
      data-pw-desk={adType}
      data-pw-mobi={adType}
    >
      <Link to="/premium">
        <img
          src="/img/ad-fallback.jpg"
          alt="WoWAnalyzer Premium - Did we help? Support us and unlock cool perks."
          style={{ maxWidth: '100%' }}
        />
      </Link>
    </div>
  );
};

export default Ad;

declare global {
  interface Window {
    tyche?: any;
    refreshAds?: () => void;
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
