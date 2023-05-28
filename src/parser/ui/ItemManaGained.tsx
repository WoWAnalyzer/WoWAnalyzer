import { formatNumber, formatThousands } from 'common/format';
import ManaIcon from 'interface/icons/Mana';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';

interface Props {
  amount: number;
  useAbbrev?: boolean; // if true, use formatNumber
  approximate?: boolean;
  customLabel?: string;
}
const ItemManaGained = ({ amount, approximate, useAbbrev, customLabel }: Props) => {
  const { combatLogParser: parser } = useCombatLogParser();
  return (
    <>
      <ManaIcon /> {approximate && '≈'}
      {formatThousands((amount / parser.fightDuration) * 1000 * 5)} MP5{' '}
      <small>
        {useAbbrev ? formatNumber(amount) : formatThousands(amount)}{' '}
        {customLabel ? customLabel : <>total mana</>}
      </small>
    </>
  );
};

export default ItemManaGained;
