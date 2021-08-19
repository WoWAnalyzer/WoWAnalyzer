import { getAlertComponent } from 'interface/Alert';
import usePremium from 'interface/usePremium';
import CombatLogParser from 'parser/core/CombatLogParser';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import DistanceMoved from 'parser/shared/modules/DistanceMoved';
// import SpellUsable from 'parser/shared/modules/SpellUsable';
// import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import React, { ReactNode } from 'react';

import { useConfig } from '../ConfigContext';
import Component from './Timeline/Component';

interface Props {
  parser: CombatLogParser;
}

const TimelineTab = ({ parser }: Props) => {
  const premium = usePremium();
  const config = useConfig();

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
      <div className="container">{alert}</div>

      <Component
        parser={parser}
        abilities={parser.getModule(Abilities)}
        buffs={parser.getModule(Buffs)}
        movement={parser.getModule(DistanceMoved).instances}
        premium={premium}
        config={parser.config.timeline}
        // isAbilityCooldownsAccurate={parser.getModule(SpellUsable).isAccurate}
        // isGlobalCooldownAccurate={parser.getModule(GlobalCooldown).isAccurate}
      />
    </>
  );
};

export default TimelineTab;
