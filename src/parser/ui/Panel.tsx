import { Panel as InterfacePanel, ErrorBoundary } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

type Props = {
  category?: STATISTIC_CATEGORY;
  position?: number;
} & React.ComponentProps<typeof InterfacePanel>;

// yes these props are no-ops. not sure why, but they are
const Panel = ({ category = STATISTIC_CATEGORY.PANELS, position, ...others }: Props) => (
  <ErrorBoundary>
    <InterfacePanel {...others} />
  </ErrorBoundary>
);

// this is needed for the Masonry wrapper
Panel.defaultProps = {
  category: STATISTIC_CATEGORY.PANELS,
};

export default Panel;
