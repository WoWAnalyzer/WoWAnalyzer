import { Panel as InterfacePanel, ErrorBoundary } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

type Props = {
  category?: STATISTIC_CATEGORY;
  position?: number;
  children: React.ReactChildren;
};

const Panel = ({ category = STATISTIC_CATEGORY.PANELS, position, ...others }: Props) => (
  <ErrorBoundary>
    <InterfacePanel {...others} />
  </ErrorBoundary>
);

export default Panel;
