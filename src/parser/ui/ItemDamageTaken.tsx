import { formatNumber, formatPercentage } from 'common/format';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';

interface Props {
  amount: number;
  approximate?: boolean;
}

const ItemDamageTaken = ({ amount, approximate }: Props) => {
  const { combatLogParser: parser } = useCombatLogParser();
  return (
    <>
      <img src="/img/shield.png" alt="Damage Taken" className="icon" /> {approximate && '≈'}
      {formatNumber((amount / parser.fightDuration) * 1000)} DTPS{' '}
      <small>{formatPercentage(parser.getPercentageOfTotalDamageTaken(amount))}% of total</small>
    </>
  );
};

export default ItemDamageTaken;
