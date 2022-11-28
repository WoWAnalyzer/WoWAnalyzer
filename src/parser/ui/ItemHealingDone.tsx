import { formatPercentage, formatNumber } from 'common/format';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';

interface Props {
  amount: number;
  approximate?: boolean;
  greaterThan?: boolean;
  lessThan?: boolean;
  /**
   * @default {true}
   */
  displayPercentage?: boolean;
}

const ItemHealingDone = ({
  amount,
  approximate,
  greaterThan,
  lessThan,
  displayPercentage = true,
}: Props) => {
  const { combatLogParser: parser } = useCombatLogParser();
  return (
    <>
      <img src="/img/healing.png" alt="Healing" className="icon" /> {approximate && '≈'}
      {greaterThan && '>'}
      {lessThan && '<'}
      {formatNumber((amount / parser.fightDuration) * 1000)} HPS{' '}
      {displayPercentage && (
        <small>{formatPercentage(parser.getPercentageOfTotalHealingDone(amount))}% of total</small>
      )}
    </>
  );
};

export default ItemHealingDone;
