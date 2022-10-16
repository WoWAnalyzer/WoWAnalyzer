import { formatNumber, formatThousands } from 'common/format';
import ManaIcon from 'interface/icons/Mana';
import CombatLogParser from 'parser/core/CombatLogParser';
import PropTypes from 'prop-types';

interface Props {
  amount: number;
  useAbbrev?: boolean; // if true, use formatNumber
  approximate?: boolean;
}
interface Context {
  parser: CombatLogParser;
}

const ItemManaGained = ({ amount, approximate, useAbbrev }: Props, { parser }: Context) => (
  <>
    <ManaIcon /> {approximate && '≈'}
    {formatThousands((amount / parser.fightDuration) * 1000 * 5)} MP5{' '}
    <small>{useAbbrev ? formatNumber(amount) : formatThousands(amount)} total mana</small>
  </>
);
ItemManaGained.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ItemManaGained;
