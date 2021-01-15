import React from 'react';
import { Link } from 'react-router-dom';

import usePremium from 'common/usePremium';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
// import SpellUsable from 'parser/shared/modules/SpellUsable';
// import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import CombatLogParser from 'parser/core/CombatLogParser';
import makeWclUrl from 'common/makeWclUrl';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';

import Component from './Component';
import Example from './example.png';

interface Props {
  parser: CombatLogParser;
}

const Container = ({ parser }: Props) => {
  const premium = usePremium();

  if (!premium) {
    return (
      <div className="container" style={{ fontSize: 20 }}>
        The timeline shows your casts, channel times, GCD, active buffs, and cooldowns for a quick
        overview of what you did. It even incorporates some of give you specific examples of casts
        that you could improve. All in one easy to use overview.
        <br />
        <br />
        <div style={{ fontSize: 14, opacity: 0.6 }}>Example</div>
        <img
          src={Example}
          style={{ width: '100%', boxShadow: 'rgba(255, 255, 255, 0.5) 0px 0px 5px' }}
        />
        <br />
        <br />
        <strong>
          You need to unlock <Link to="/premium">WoWAnalyzer Premium</Link> to access the
          WoWAnalyzer timeline.
        </strong>
        <br />
        <br />
        <div style={{ fontSize: 14 }}>
          Not yet ready to join? The{' '}
          <a
            href={makeWclUrl(parser.report.code, {
              fight: parser.fight.id,
              source: parser ? parser.playerId : undefined,
              view: 'timeline',
              type: 'casts',
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WarcraftLogsIcon style={{ height: '1.2em', marginTop: '-0.1em' }} /> Warcraft Logs
            timeline
          </a>{' '}
          shows similar information as well.
        </div>
      </div>
    );
  }

  return (
    <Component
      parser={parser}
      abilities={parser.getModule(Abilities)}
      buffs={parser.getModule(Buffs)}
      // isAbilityCooldownsAccurate={parser.getModule(SpellUsable).isAccurate}
      // isGlobalCooldownAccurate={parser.getModule(GlobalCooldown).isAccurate}
    />
  );
};

export default Container;
