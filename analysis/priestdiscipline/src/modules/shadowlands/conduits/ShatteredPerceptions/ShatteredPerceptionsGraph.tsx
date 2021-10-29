import './style.scss';
import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import DonutChart from 'parser/ui/DonutChart';
import React, { useMemo, useState } from 'react';
import Toggle from 'react-toggle';

interface ShatteredPerceptionsGraphProps {
  // The healing from the duration bonus of the Shattered Perceptions conduit
  durationBonusHealing: number;
  // The healing bonus from everything except duration bonus
  bonusHealing: number;
  // The damage from the duration bonus of the Shattered Perceptions conduit
  durationBonusDamage: number;
  // The damage bonus from everything except duration bonus
  bonusDamage: number;
}

interface ShatteredPerceptionsGraphItem {
  color: string;
  spellId: number;
  label: string;
  value: number;
  valueTooltip?: string | number;
}

function generateHealingItems(
  bonusHealing: number,
  durationBonusHealing: number,
): ShatteredPerceptionsGraphItem[] {
  return [
    {
      color: '#fab700',
      label: 'Bonus Healing',
      spellId: SPELLS.SHATTERED_PERCEPTIONS.id,
      value: bonusHealing,
      valueTooltip: formatThousands(bonusHealing),
    },
    {
      color: '#ac1f39',
      label: 'Extension Bonus Healing',
      spellId: SPELLS.MINDGAMES_REVERSAL.id,
      value: durationBonusHealing,
      valueTooltip: formatThousands(durationBonusHealing),
    },
  ];
}

function generateDamageItems(
  bonusDamage: number,
  durationBonusDamage: number,
): ShatteredPerceptionsGraphItem[] {
  return [
    {
      color: '#fab700',
      label: 'Bonus Damage',
      spellId: SPELLS.SHATTERED_PERCEPTIONS.id,
      value: bonusDamage,
      valueTooltip: formatThousands(bonusDamage),
    },
    {
      color: '#ac1f39',
      label: 'Extension Bonus Damage',
      spellId: SPELLS.MINDGAMES_REVERSAL.id,
      value: durationBonusDamage,
      valueTooltip: formatThousands(durationBonusDamage),
    },
  ];
}

function ShatteredPerceptionsGraph(props: ShatteredPerceptionsGraphProps) {
  const [showDamage, setShowDamage] = useState<boolean>(false);

  const healingItems = useMemo(
    () => generateHealingItems(props.bonusHealing, props.durationBonusHealing),
    [props.bonusHealing, props.durationBonusHealing],
  );

  const damageItems = useMemo(
    () => generateDamageItems(props.bonusDamage, props.durationBonusDamage),
    [props.bonusDamage, props.durationBonusDamage],
  );

  if (props.durationBonusDamage === 0 && props.durationBonusHealing === 0) {
    return null;
  }

  return (
    <aside className="pad">
      <hr />
      <header className="sp-header">
        <label className="sp-label">{showDamage ? 'Damage breakdown' : 'Healing breakdown'}</label>
        <Toggle
          icons={false}
          checked={showDamage}
          onChange={(e) => setShowDamage(e.target.checked)}
        />
      </header>
      <DonutChart items={showDamage ? damageItems : healingItems} />
    </aside>
  );
}

export default ShatteredPerceptionsGraph;
