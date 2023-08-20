import { formatDuration } from 'common/format';
import Uptime from 'interface/icons/Uptime';

interface Props {
  effective: number;
  waste?: number;
  approximate?: boolean;
}

const ItemCooldownReduction = ({ effective, waste, approximate }: Props) => {
  return (
    <>
      <Uptime /> {approximate && '≈'}
      {formatDuration(effective)} CDR {waste && <small>{formatDuration(waste)} wasted</small>}
    </>
  );
};

export default ItemCooldownReduction;
