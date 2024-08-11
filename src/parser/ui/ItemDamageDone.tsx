import { formatNumber, formatPercentage } from 'common/format';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import DamageIcon from 'interface/icons/Damage';

interface Props {
  amount: number;
  approximate?: boolean;
  /**
   * @default {true}
   */
  displayPercentage?: boolean;
}

const ItemDamageDone = ({ amount, approximate, displayPercentage = true }: Props) => {
  const { combatLogParser: parser } = useCombatLogParser();
  return (
    <>
      <DamageIcon /> {approximate && '≈'}
      {formatNumber((amount / parser.fightDuration) * 1000)} DPS{' '}
      {displayPercentage && (
        <small>{formatPercentage(parser.getPercentageOfTotalDamageDone(amount))} % of total</small>
      )}
    </>
  );
};

export default ItemDamageDone;
