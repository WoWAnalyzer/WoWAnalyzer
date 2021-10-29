import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Ability } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import React from 'react';

interface ClaritySourceDonutProps {
  abilityMap: Map<number, Ability>;
  healingMap: Map<number, number>;
}

interface ClaritySourceGraphItem {
  color?: string;
  spellId: number;
  label: string;
  value: number;
  valueTooltip?: string | number;
}

/**
 * I'm not writing color values for every possible spell here
 * https://gist.github.com/bendc/76c48ce53299e6078a76
 */
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomColor = () => {
  const h = randomInt(0, 360);
  const s = randomInt(42, 98);
  const l = randomInt(40, 90);
  return `hsl(${h},${s}%,${l}%)`;
};

// Override some names
const nameMap = {
  [SPELLS.MINDGAMES_REVERSAL.id]: 'Mindgames (Reversal)',
  [SPELLS.MAGIC_MELEE.id]: 'Mindbender',
  [SPELLS.LIGHTSPAWN_MELEE.id]: 'Lightspawn',
};

function generateHealingItems(
  abilities: Ability[],
  healingMap: Map<number, number>,
): ClaritySourceGraphItem[] {
  return abilities.map((ability) => {
    const healingDone = healingMap.get(ability.guid) || 0;

    return {
      color: `${randomColor()}`,
      spellId: ability.guid,
      label: nameMap[ability.guid] || ability.name,
      value: healingDone,
      valueTooltip: formatThousands(healingDone),
    };
  });
}

function ClaritySourceDonut(props: ClaritySourceDonutProps) {
  const abilities = Array.from(props.abilityMap.values());

  return (
    <aside className="pad">
      <hr />
      <header>
        <label>Clarity Associated Sources</label>
      </header>
      <DonutChart items={generateHealingItems(abilities, props.healingMap)} />
    </aside>
  );
}

export default ClaritySourceDonut;
