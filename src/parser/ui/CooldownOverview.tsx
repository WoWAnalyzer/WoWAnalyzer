import { TrackedCooldown } from 'parser/shared/modules/CooldownThroughputTracker';

import Cooldown from './Cooldown';

type props = {
  fightStart: number;
  fightEnd: number;
  cooldowns: TrackedCooldown[];
  applyTimeFilter: (start: number, end: number) => null;
};

const CooldownOverview = ({ fightStart, fightEnd, cooldowns, applyTimeFilter }: props) => (
  <ul className="list">
    {cooldowns.map((cooldown) => (
      <li
        key={`${cooldown.spell}-${cooldown.start}`}
        className="item clearfix"
        style={{ padding: '10px 30px' }}
      >
        <Cooldown
          cooldown={cooldown}
          fightStart={fightStart}
          fightEnd={fightEnd}
          applyTimeFilter={applyTimeFilter}
        />
      </li>
    ))}
  </ul>
);

export default CooldownOverview;
