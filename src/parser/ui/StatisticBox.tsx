import Statistic, { StatisticSize } from 'parser/ui/Statistic';
import { CSSProperties, MouseEventHandler, PureComponent, ReactNode } from 'react';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';
import './StatisticBox.css';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

export interface Props {
  icon?: ReactNode;
  value: ReactNode;
  tooltip?: ReactNode;
  label?: ReactNode;
  footer?: ReactNode;
  category?: STATISTIC_CATEGORY;
  position?: number;
  children?: ReactNode;
  style?: CSSProperties;
  expanded?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  size?: StatisticSize;
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

interface State {
  expanded: boolean;
}

/**
 * @deprecated Use `parser/ui/Statistic` instead.
 */
class StatisticBox extends PureComponent<Props, State> {
  static defaultProps = {
    category: STATISTIC_CATEGORY.GENERAL,
    style: {},
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: props.expanded ?? false,
    };

    this.toggleExpansion = this.toggleExpansion.bind(this);
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.expanded !== this.props.expanded) {
      this.setState({
        expanded: this.props.expanded ?? false,
      });
    }
  }

  toggleExpansion() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { icon, value, label, footer, children, style, ...others } = this.props;
    delete others.category;
    delete others.position;
    // TODO: make sure "tooltip" properties are correctly passed, if some contain HTML tags, fix them into <>...</>
    return (
      <Statistic
        {...others}
        className="statistic-box"
        style={{ ...style, height: 'auto', zIndex: this.state.expanded ? 2 : 1 }}
      >
        <div className="pad">
          <label>
            {icon} {label}
          </label>
          <div className="value">{value}</div>

          {footer && <div style={{ marginTop: '0.5em' }}>{footer}</div>}
        </div>
        {children && (
          <>
            <div className="row">
              <div className="col-xs-12">
                {this.state.expanded && <div className="statistic-expansion">{children}</div>}
              </div>
            </div>

            <div className="statistic-expansion-button-holster">
              <button onClick={this.toggleExpansion} className="btn btn-primary">
                {!this.state.expanded && <span className="glyphicon glyphicon-chevron-down" />}
                {this.state.expanded && <span className="glyphicon glyphicon-chevron-up" />}
              </button>
            </div>
          </>
        )}
      </Statistic>
    );
  }
}

export default StatisticBox;
