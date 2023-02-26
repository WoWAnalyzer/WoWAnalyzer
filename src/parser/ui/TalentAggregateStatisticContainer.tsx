import { ReactNode } from 'react';
import Statistic from './Statistic';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';
import './TalentAggregateStatistic.scss';

type Props = {
  children: ReactNode;
  title: ReactNode;
  smallTitle?: boolean;
  footer?: ReactNode;
  smallFooter?: boolean;
  /**
   * @default {true}
   */
  wide?: boolean;
  category?: STATISTIC_CATEGORY;
  position?: number;
  tooltip?: ReactNode | string;
};

/**Statistic container for the collection of SourceContributionBarSubStatistics */
const TalentAggregateStatisticContainer = ({
  children,
  title,
  smallTitle,
  footer,
  smallFooter,
  wide = true,
  ...others
}: Props) => (
  <Statistic wide={wide} size="flexible" {...others}>
    <div className="pad">
      <div className="talent-aggregate-container">
        {smallTitle || !wide ? (
          <small>{title}</small>
        ) : (
          <h3>
            <div className="value">{title}</div>
          </h3>
        )}
      </div>
      {children}
      {footer && (
        <div className="boring-value">
          {smallFooter ? (
            <small>
              *{footer}.<br /> *Labels are hidden for trivial amounts
            </small>
          ) : (
            <h3>
              {footer}.<br /> Labels are hidden for trivial amounts
            </h3>
          )}
        </div>
      )}
    </div>
  </Statistic>
);

export default TalentAggregateStatisticContainer;
