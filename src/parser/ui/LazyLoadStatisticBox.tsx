import { ReactNode, useState } from 'react';

import StatisticBox from './StatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { useResults } from 'interface/report/Results/ResultsContext';

export { STATISTIC_ORDER } from './StatisticBox';

interface Props {
  loader: () => Promise<any>;
  label?: ReactNode;
  value: ReactNode;
  category?: STATISTIC_CATEGORY;
  children?: ReactNode;
  position?: number;
  icon?: ReactNode;
  tooltip?: ReactNode;
  /**
   * A relative or absolute URL. If set, a button will be attached to the bottom of the statistic
   * box that a user can click to be sent to the given URL.
   */
  drilldown?: string;
  /**
   * A node to display upon the user clicking an *expand* arrow at the bottom of the statistic box.
   */
  dropdown?: ReactNode;
}

/**
 * @deprecated Use `parser/ui/Statistic` instead.
 */
const LazyLoadStatisticBox = ({ loader, value, children, ...others }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { generateResults } = useResults();

  const handleClick = () => {
    if (loaded || loading) {
      return;
    }
    setLoading(true);
    loader().then((result) => {
      setLoading(false);
      setLoaded(true);
      generateResults();
      return result;
    });
  };

  return (
    <StatisticBox
      onClick={handleClick}
      value={loaded ? value : loading ? 'Loading...' : 'Click to load'}
      style={{ cursor: loaded ? undefined : 'pointer' }}
      {...others}
    >
      {loaded ? children : null}
    </StatisticBox>
  );
};

export default LazyLoadStatisticBox;
