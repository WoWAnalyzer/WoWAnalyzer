import React, {useCallback, useState} from 'react';

import DropdownIcon from 'interface/icons/Dropdown';
import InformationIcon from 'interface/icons/Information';
import { ControlledExpandable } from 'interface/common/Expandable';
import colorForPerformance from 'common/colorForPerformance';

import calculateMedian from './helpers/calculateMedian';
import average from './helpers/average';
import harmonic from './helpers/harmonic';

export const RuleContext = React.createContext((value: number) => {/**/});


export enum PERFORMANCE_METHOD {
  DEFAULT = 'DEFAULT',
  MEDIAN = 'MEDIAN',
  AVERAGE = 'AVERAGE',
  LOWEST = 'LOWEST',
  FIRST = 'FIRST',
  HARMONIC = 'HARMONIC',
};

interface Props {
  name: React.ReactNode;
  children: React.ReactNode;
  description?: React.ReactNode;
  performanceMethod?: PERFORMANCE_METHOD;
}

interface State {
  requirementPerformances: number[],
  performance: number;
  passed: boolean;
  expanded: boolean;
}

const Rule = (props: Props) => {

  const [state, setState] = useState<State>({requirementPerformances: [], performance: 1, passed: true, expanded: false});


  const calculateRulePerformance = useCallback((values: number[], style = PERFORMANCE_METHOD.DEFAULT) => {
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
      case PERFORMANCE_METHOD.HARMONIC:
        return harmonic(values);
      default:
        throw new Error(`Unknown style: ${style}`);
    }
  }, [])

 

  const checkEmptyRule = (child: React.ReactNode) => {
    if (React.isValidElement(child) && child?.props) {
      return true;
    } else {
      return false;
    }
  }

  const setRequirementPerformance = (p: number) => {
    // We don't have to worry about adding the same Requirement's performance multiple times here because it's only called in the Requirement's constructor, which is only called once.
    setState((prevState: State) => {
      const requirementPerformances: State['requirementPerformances'] = [...prevState.requirementPerformances, p];
      const performance = requirementPerformances.length > 0 ? calculateRulePerformance(requirementPerformances, props.performanceMethod) : 1
      const passed = performance > 0.666;
      const expanded = !passed;
      return {requirementPerformances, performance: performance, passed, expanded}
    })
  }

  const { name, children: requirements, description } = props;

  if (!requirements || (Array.isArray(requirements) && !requirements.some(checkEmptyRule))) {
    return null;
  }

  const inverseExpanded = () => {
    setState(prevState => ({...prevState, expanded: !prevState.expanded}))
  }

  return (
    <RuleContext.Provider value={setRequirementPerformance}>
      <ControlledExpandable
        element="li"
        className={state.passed ? 'passed' : 'failed'}
        inverseExpanded={inverseExpanded}
        expanded={state.expanded}
        header={(
          <div className="flex wrapable">
            <div className="flex-main name">
              {name}
            </div>
            <div className="flex-sub perf">
              <div className="perf-container">
                <div
                  className="perf-bar"
                  style={{
                    width: `${state.performance * 100}%`,
                    backgroundColor: colorForPerformance(state.performance),
                  }}
                />
              </div>
            </div>
            <div className="flex-sub chevron">
              <div>
                <DropdownIcon />
              </div>
            </div>
          </div>
        )}
      >
        {description && (
          <div className="row text-muted description">
            <InformationIcon />
            <div className="col-md-12">
              {description}
            </div>
          </div>
        )}
        <div className="row">
          {requirements}
        </div>
      </ControlledExpandable>
    </RuleContext.Provider>
  );
}

export default Rule;
