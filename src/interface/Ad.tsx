import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

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

// TODO: this will not work well with
const Ad = ({ style, location }: Props) => {
  const { selectorId, type: adType } = units[location || Location.Top];

  useEffect(() => {
    refreshAds();
  }, [location]);

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
          style={{ maxWidth: '100%', marginTop: 250 / 2 - 90 / 2 }}
        />
      </Link>
    </div>
  );
};

export default Ad;

declare global {
  interface Window {
    ramp?: any;
  }
}

export function initAds() {
  const ramp = window.ramp;
  if (!ramp) {
    return;
  }

  ramp.onReady = function () {
    ramp.initCallbackHappened = true;
    refreshAds();
  };
}

export function refreshAds() {
  const ramp = window.ramp;
  try {
    if (ramp && ramp.initCallbackHappened) {
      ramp.destroyUnits('all');
      ramp
        .addUnits(Object.values(units))
        .then(() => {
          ramp.displayUnits();
        })
        .catch((e: Error) => {
          ramp.displayUnits();
          console.log('displayUnits error: ', e);
        });
    }
  } catch (e) {
    console.log('failed to refresh ads:', e);
  }
}

window.ramp = {
  mode: 'ramp',
  config: '//config.playwire.com/1024476/v2/websites/73270/banner.json',
  initCallbackHappened: false,
  passiveMode: true,
};
