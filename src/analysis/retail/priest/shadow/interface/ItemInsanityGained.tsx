import { formatNumber } from 'common/format';
import InsanityIcon from 'interface/icons/Insanity';

interface Props {
  amount: number;
  approximate?: boolean;
}
const ItemInsanityGained = ({ amount, approximate }: Props) => (
  <>
    <InsanityIcon /> {approximate && '≈'}
    {formatNumber(amount)}
    <small> Insanity Generated</small>
  </>
);

export default ItemInsanityGained;
