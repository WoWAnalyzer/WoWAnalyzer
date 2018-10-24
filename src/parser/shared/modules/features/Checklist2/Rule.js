import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import TickIcon from 'interface/icons/Tick';
import CrossIcon from 'interface/icons/Cross';
import DropdownIcon from 'interface/icons/Dropdown';
import InformationIcon from 'interface/icons/Information';

import colorForPerformance from './helpers/colorForPerformance';
import calculateMedian from './helpers/calculateMedian';
import average from './helpers/average';

export const RuleContext = React.createContext();

export const PERFORMANCE_METHOD = {
  DEFAULT: 'DEFAULT',
  MEDIAN: 'MEDIAN',
  AVERAGE: 'AVERAGE',
  LOWEST: 'LOWEST',
  FIRST: 'FIRST',
};

class Rule extends React.PureComponent {
  static propTypes = {
    name: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    description: PropTypes.node,
    performanceMethod: PropTypes.oneOf(Object.values(PERFORMANCE_METHOD)),
  };

  constructor() {
    super();
    this.state = {
      requirementPerformances: [],
      expanded: false,
    };
    this.handleToggleExpand = this.handleToggleExpand.bind(this);
    this.setRequirementPerformance = this.setRequirementPerformance.bind(this);
  }
  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  handleToggleExpand() {
    this.setState({
      expanded: !this.state.expanded,
    });
  }
  static calculateRulePerformance(values, style = PERFORMANCE_METHOD.DEFAULT) {
    // Lowest would generally be too punishing for small mistakes, if you want to have a single value tank the rule consider making it its own rule.
    // Average would mark things as OK when one thing was OK and 3 things were "average", I think this is wrong and it should mark the rule as average. Median achieves this.
    // Actual Median could mark a rule as 100% ok when there are still some things being neglected, so instead I opted for the best of both worlds and using the lowest of the median or average by default.

    switch (style) {
      case PERFORMANCE_METHOD.DEFAULT:
        return Math.min(calculateMedian(values), average(values));
      case PERFORMANCE_METHOD.MEDIAN:
        return calculateMedian(values);
      case PERFORMANCE_METHOD.AVERAGE:
        return average(values);
      case PERFORMANCE_METHOD.LOWEST:
        return Math.min(...values);
      case PERFORMANCE_METHOD.FIRST:
        return values[0];
      default:
        throw new Error(`Unknown style: ${style}`);
    }
  }

  setRequirementPerformance(performance) {
    // We don't have to worry about adding the same Requirement's performance multiple times here because it's only called in the Requirement's constructor, which is only called once.
    this.setState(state => ({
      requirementPerformances: [
        ...state.requirementPerformances,
        performance,
      ],
    }));
  }

  render() {
    const { name, children, description, performanceMethod } = this.props;

    const requirementPerformances = this.state.requirementPerformances;
    const performance = requirementPerformances.length > 0 ? this.constructor.calculateRulePerformance(requirementPerformances, performanceMethod) : 1;

    return (
      <RuleContext.Provider value={this.setRequirementPerformance}>
        <div className={`expandable ${this.state.expanded ? 'expanded' : ''}`}>
          <div className="meta checklist-item" onClick={this.handleToggleExpand}>
            <div className="flex">
              <div className="flex-sub content-middle" style={{ paddingRight: 18 }}>
                <div className="chevron">{/* this div ensures vertical alignment */}
                  <DropdownIcon />
                </div>
              </div>
              <div className="flex-sub content-middle" style={{ paddingRight: 18 }}>
                <div>{/* this div ensures vertical alignment */}
                  {performance > 0.666 ? <TickIcon style={{ color: 'green' }} /> : <CrossIcon style={{ color: 'red' }} />}
                </div>
              </div>
              <div className="flex-main">
                {name}
              </div>
              <div className="flex-sub content-middle" style={{ width: 100 }}>
                <div className="performance-bar-container">
                  <div
                    className="performance-bar small"
                    style={{
                      width: `${performance * 100}%`,
                      transition: 'background-color 800ms',
                      backgroundColor: colorForPerformance(performance),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Requirements must always render so the Rule gets their performance values, so we need to toggle the items via display: none. I know it's not best practice, but it has very low cost and prevents a lot of trouble for contributors. */}
          <div className="details" style={{ display: this.state.expanded ? undefined : 'none', paddingLeft: 65, paddingRight: 65, position: 'relative', minHeight: 80 }}>
            {description && (
              <>
                <div className="row" style={{ position: 'relative', marginBottom: 10 }}>
                  <InformationIcon className="text-muted" style={{ position: 'absolute', top: '50%', left: -33, transform: 'translateY(-33%)', fontSize: '2em' }} />
                  <div className="col-md-12 text-muted">
                    <div className="flex">
                      <div className="flex-main">
                        {description}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="row">
              {children}
            </div>
          </div>
        </div>
      </RuleContext.Provider>
    );
  }
}

export default Rule;
