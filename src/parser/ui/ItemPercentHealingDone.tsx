import { formatPercentage, formatNumber } from 'common/format';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';

interface Props {
  amount: number;
  approximate?: boolean;
  greaterThan?: boolean;
  lessThan?: boolean;
}

/**
 * Like ItemHealingDone, but with the emphasis on the percentage over the HPS.
 */
const ItemPercentHealingDone = ({ amount, approximate, greaterThan, lessThan }: Props) => {
  const { combatLogParser: parser } = useCombatLogParser();
  return (
    <>
      <img src="/img/healing.png" alt="Healing" className="icon" /> {approximate && '≈'}
      {greaterThan && '>'}
      {lessThan && '<'}
      {formatPercentage(parser.getPercentageOfTotalHealingDone(amount))} %{' '}
      <small>{formatNumber((amount / parser.fightDuration) * 1000)} HPS</small>
    </>
  );
};

export default ItemPercentHealingDone;
