import { formatNumber, formatPercentage } from 'common/format';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';

interface Props {
  amount: number;
  approximate?: boolean;
}

const ItemDamageDone = ({ amount, approximate }: Props) => {
  const { combatLogParser: parser } = useCombatLogParser();
  return (
    <>
      <img src="/img/sword.png" alt="Damage" className="icon" /> {approximate && '≈'}
      {formatNumber((amount / parser.fightDuration) * 1000)} DPS{' '}
      <small>{formatPercentage(parser.getPercentageOfTotalDamageDone(amount))} % of total</small>
    </>
  );
};

export default ItemDamageDone;
