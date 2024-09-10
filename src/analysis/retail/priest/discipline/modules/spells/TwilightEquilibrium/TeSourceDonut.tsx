import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { formatThousands } from 'common/format';
import { Ability } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';

interface TeSourceDonutProps {
  abilityMap: Map<number, Ability>;
  healingMap: Map<number, number>;
}

interface TeSourceGraphItem {
  color: string;
  spellId: number;
  label: string;
  value: number;
  valueTooltip?: string | number;
}

const COLORS = {
  [SPELLS.MIND_BLAST.id]: '#FF8B13',
  [SPELLS.DIVINE_STAR_DAMAGE.id]: '#3D1766',
  [SPELLS.HALO_DAMAGE.id]: '#3D1766',
  [TALENTS_PRIEST.SCHISM_TALENT.id]: '#A31ACB',
  [SPELLS.DARK_REPRIMAND_DAMAGE.id]: '#3C79F5',
  [SPELLS.PENANCE.id]: '#93BFCF',
  [TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id]: '#820000',
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomColor = () => {
  const h = randomInt(0, 360);
  const s = randomInt(42, 98);
  const l = randomInt(40, 90);
  return `hsl(${h},${s}%,${l}%)`;
};

function generateHealingItems(
  abilities: Ability[],
  healingMap: Map<number, number>,
): TeSourceGraphItem[] {
  return abilities
    .map((ability) => {
      const healingDone = healingMap.get(ability.guid) || 0;

      return {
        color: COLORS[ability.guid] ? `${COLORS[ability.guid]}` : randomColor(),
        spellId: ability.guid,
        label: ability.name,
        value: healingDone,
        valueTooltip: formatThousands(healingDone),
      };
    })
    .sort((a, b) => {
      return Math.sign(b.value - a.value);
    });
}

function TeSourceDonut(props: TeSourceDonutProps) {
  const abilities = Array.from(props.abilityMap.values());

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

export default TeSourceDonut;
