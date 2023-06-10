import SpellIcon from 'interface/SpellIcon';
import Spell from 'common/SPELLS/Spell';

interface Props {
  spell: Spell;
  count: number;
}

const ReportRaidBuffListItem = ({ spell, count }: Props) => (
  <div className={`panel ${count > 0 ? 'available' : 'unavailable'}`}>
    <SpellIcon spell={spell} />
    <div className="count">{count}</div>
  </div>
);

export default ReportRaidBuffListItem;
