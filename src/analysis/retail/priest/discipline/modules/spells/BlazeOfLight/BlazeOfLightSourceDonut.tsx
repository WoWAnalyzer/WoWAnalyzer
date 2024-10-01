import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import { Ability } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';

interface BlazeOfLightSourceDonutProps {
  abilityMap: Map<number, Ability>;
  healingMap: Map<number, number>;
}

interface BlazeOfLightSourceGraphItem {
  color: string;
  spellId: number;
  label: string;
  value: number;
  valueTooltip?: string | number;
}

const COLORS = {
  [SPELLS.SMITE.id]: '#fff',
  [SPELLS.VOID_BLAST_DAMAGE_DISC.id]: '#8d4499',
  [SPELLS.PENANCE.id]: '#0cd368',
  [SPELLS.DARK_REPRIMAND_DAMAGE.id]: '#3C79F5',
};

function generateHealingItems(
  abilities: Ability[],
  healingMap: Map<number, number>,
): BlazeOfLightSourceGraphItem[] {
  return abilities.map((ability) => {
    const healingDone = healingMap.get(ability.guid) || 0;

    return {
      color: `${COLORS[ability.guid]}`,
      spellId: ability.guid,
      label: ability.name,
      value: healingDone,
      valueTooltip: formatThousands(healingDone),
    };
  });
}

function BlazeOfLightSourceDonut(props: BlazeOfLightSourceDonutProps) {
  const abilities = Array.from(props.abilityMap.values());
  console.log(props.healingMap);

  return (
    <aside className="pad">
      <hr />
      <header>
        <label>Breakdown of Atonement Healing</label>
      </header>
      <DonutChart
        items={generateHealingItems(abilities, props.healingMap).filter((item) => item.value !== 0)}
      />
    </aside>
  );
}

export default BlazeOfLightSourceDonut;
