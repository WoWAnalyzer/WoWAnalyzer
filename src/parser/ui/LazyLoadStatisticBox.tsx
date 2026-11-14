import { ReactNode, useState } from 'react';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { useResults } from 'interface/report/Results/ResultsContext';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

interface Props {
  loader: () => Promise<unknown>;
  label?: ReactNode;
  value: ReactNode;
  category?: STATISTIC_CATEGORY;
  /**
   * Shown in the expandable section at the bottom of the statistic box once loaded.
   */
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
 * A `Statistic` that only runs its (expensive) `loader` once the user clicks it.
 */
const LazyLoadStatisticBox = ({
  loader,
  icon,
  label,
  value,
  children,
  dropdown,
  ...others
}: Props) => {
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
    <Statistic
      size="flexible"
      onClick={handleClick}
      style={{ cursor: loaded ? undefined : 'pointer' }}
      dropdown={loaded ? children || dropdown : undefined}
      {...others}
    >
      <div className="pad boring-text">
        <label>
          {icon} {label}
        </label>
        <div className="value">{loaded ? value : loading ? 'Loading...' : 'Click to load'}</div>
      </div>
    </Statistic>
  );
};

export default LazyLoadStatisticBox;
