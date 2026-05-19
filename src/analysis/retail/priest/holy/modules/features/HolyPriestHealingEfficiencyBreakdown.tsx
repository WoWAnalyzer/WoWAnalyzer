import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import {
  BarHeader,
  DetailHeader,
  HealingEfficiencyTable,
} from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import { useState } from 'react';
import Toggle from 'interface/react-toggle';

import HolyPriestHealingEfficiencyTracker from './HolyPriestHealingEfficiencyTracker';

interface Props {
  tracker: HolyPriestHealingEfficiencyTracker;
}

const HolyPriestHealingEfficiencyBreakdown = ({ tracker }: Props) => {
  const [showHealing, setShowHealing] = useState(true);
  const [detailedView, setDetailedView] = useState(false);
  const [showCooldowns, setShowCooldowns] = useState(false);
  const [, setIncludeEchoOfLight] = useState(false);

  return (
    <div>
      <div className="row">
        <div className="col-md-12">
          <div className="pull-left">
            <div
              className="toggle-control pull-right"
              style={{ marginLeft: '.5em', marginRight: '.5em' }}
            >
              <Toggle
                defaultChecked={false}
                icons={false}
                onChange={(event) => setDetailedView(event.target.checked)}
                id="detailed-toggle"
              />
              <label htmlFor="detailed-toggle" style={{ marginLeft: '0.5em' }}>
                Detailed View
              </label>
            </div>
          </div>
          <div className="pull-right">
            <div
              className="toggle-control pull-left"
              style={{ marginLeft: '.5em', marginRight: '.5em' }}
            >
              <Toggle
                defaultChecked={false}
                icons={false}
                onChange={(event) => {
                  tracker.includeEchoOfLight = event.target.checked;
                  setIncludeEchoOfLight(event.target.checked);
                }}
                id="echo-of-light-toggle"
              />
              <label htmlFor="echo-of-light-toggle" style={{ marginLeft: '0.5em' }}>
                Include <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />
              </label>
            </div>
            <div
              className="toggle-control pull-left"
              style={{ marginLeft: '.5em', marginRight: '.5em' }}
            >
              <Toggle
                defaultChecked={false}
                icons={false}
                onChange={(event) => setShowCooldowns(event.target.checked)}
                id="cooldown-toggle"
              />
              <label htmlFor="cooldown-toggle" style={{ marginLeft: '0.5em' }}>
                Show Cooldowns
              </label>
            </div>
            <div
              className="toggle-control pull-left"
              style={{ marginLeft: '.5em', marginRight: '.5em' }}
            >
              <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em', marginRight: '1em' }}>
                Show Damage
              </label>
              <Toggle
                defaultChecked
                icons={false}
                onChange={(event) => setShowHealing(event.target.checked)}
                id="healing-toggle"
              />
              <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em' }}>
                Show Healing
              </label>
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ability</th>
                {detailedView ? (
                  <DetailHeader showHealing={showHealing} />
                ) : (
                  <BarHeader showHealing={showHealing} />
                )}
              </tr>
            </thead>
            <tbody>
              <HealingEfficiencyTable
                tracker={tracker}
                showHealing={showHealing}
                detailedView={detailedView}
                showCooldowns={showCooldowns}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HolyPriestHealingEfficiencyBreakdown;
