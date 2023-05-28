import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  rightAddon?: ReactNode;
}

const StatisticsSectionTitle = ({ rightAddon, children }: Props) => (
  <div className="statistics-section-title">
    {rightAddon && <div className="pull-right">{rightAddon}</div>}
    <h1>{children}</h1>
  </div>
);

export default StatisticsSectionTitle;
