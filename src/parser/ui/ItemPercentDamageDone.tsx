import { formatPercentage, formatNumber } from 'common/format';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';

interface Props {
  amount: number;
  approximate?: boolean;
  greaterThan?: boolean;
  lessThan?: boolean;
}
/**
 * Like ItemDamageDone, but with the emphasis on the percentage over the DPS.
 */
const ItemPercentDamageDone = ({ amount, approximate, greaterThan, lessThan }: Props) => {
  const { combatLogParser: parser } = useCombatLogParser();
  return (
    <>
      <img src="/img/sword.png" alt="Damage" className="icon" /> {approximate && '≈'}
      {greaterThan && '>'}
      {lessThan && '<'}
      {formatPercentage(parser.getPercentageOfTotalDamageDone(amount))} %{' '}
      <small>{formatNumber((amount / parser.fightDuration) * 1000)} DPS</small>
    </>
  );
};

export default ItemPercentDamageDone;
