import CooldownComponent, { Cooldown } from './Cooldown';

type props = {
  fightStart: number;
  fightEnd: number;
  cooldowns: Cooldown[];
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
        <CooldownComponent
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
