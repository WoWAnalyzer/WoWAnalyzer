import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import TickIcon from 'Interface/Icons/Tick';
import CrossIcon from 'Interface/Icons/Cross';
import ChevronIcon from 'Interface/Icons/Chevron';
import InformationIcon from 'Interface/Icons/Information';

import calculateMedian from './helpers/calculateMedian';
import colorForPerformance from './helpers/colorForPerformance';

export const RuleContext = React.createContext();

class Rule extends React.PureComponent {
  static propTypes = {
    name: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    description: PropTypes.node,
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
  static calculateRulePerformance(values, style = 'median') {
    // Lowest would generally be too punishing for small mistakes, if you want to have a single value tank the rule consider making it its own rule.
    // Average would mark things as OK when one thing was OK and 3 things were "average", I think this is wrong and it should mark the rule as average. Median achieves this.

    switch (style) {
      case 'median':
        return calculateMedian(values);
      case 'average':
        return values.reduce((c, p) => c + p, 0) / values.length;
      case 'lowest':
        return Math.min(...values);
      case 'first':
        return values[0];
      default:
        throw new Error(`Unknown style: ${style}`);
    }
  }

  setRequirementPerformance(index, performance) {
    this.setState(state => {
      const requirementPerformances = [...state.requirementPerformances];
      requirementPerformances[index] = performance;
      return {
        requirementPerformances,
      };
    });
  }

  render() {
    const { name, children, description } = this.props;

    const performance = this.constructor.calculateRulePerformance(this.state.requirementPerformances);

    return (
      <RuleContext.Provider value={this.setRequirementPerformance}>
        <div className={`expandable ${this.state.expanded ? 'expanded' : ''}`}>
          <div className="meta" onClick={this.handleToggleExpand}>
            <div className="flex" style={{ fontSize: '1.4em' }}>
              <div className="flex-sub content-middle" style={{ paddingRight: 22 }}>
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
              <div className="flex-sub content-middle" style={{ paddingLeft: 22 }}>
                <div className="chevron">{/* this div ensures vertical alignment */}
                  <ChevronIcon />
                </div>
              </div>
            </div>
          </div>
          {/* Requirements must always render so the Rule gets their performance values, so we need to toggle the items via display: none. I know it's not best practice, but it has very low cost and prevents a lot of trouble for contributors. */}
          <div className="details" style={{ display: this.state.expanded ? undefined : 'none' }}>
            {description && (
              <div className="row" style={{ marginBottom: 10 }}>
                <div className="col-md-12 text-muted">
                  <div className="flex">
                    <div className="flex-sub content-middle" style={{ fontSize: '3.5em', lineHeight: 1, marginRight: 20 }}>
                      <div>{/* this div ensures vertical alignment */}
                        <InformationIcon />
                      </div>
                    </div>
                    <div className="flex-main">
                      {description}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="row">
              {React.Children.map(children, (child, index) => (
                React.cloneElement(child, {
                  id: index,
                  className: 'col-md-6',
                })
              ))}
            </div>
          </div>
        </div>
      </RuleContext.Provider>
    );
  }
}

export default Rule;
