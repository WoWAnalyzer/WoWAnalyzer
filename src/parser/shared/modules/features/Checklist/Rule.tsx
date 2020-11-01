import React, {useCallback, useEffect, useRef, useState} from 'react';

import DropdownIcon from 'interface/icons/Dropdown';
import InformationIcon from 'interface/icons/Information';
import Expandable from 'interface/common/Expandable';
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

const Rule = (props: Props) => {
  const [requirementPerformances, setRequirementPerformances] = useState<number[]>([]);
  const expandable = useRef<Expandable>(null);

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

  const performance = useCallback(() => {
    const performanceMethod = props.performanceMethod;
    return requirementPerformances.length > 0 ? calculateRulePerformance(requirementPerformances, performanceMethod) : 1;
  }, [props.performanceMethod, calculateRulePerformance, requirementPerformances])

  const passed = useCallback(() => performance() > 0.666, [performance])

  useEffect(() => {
    if (passed()) {
      return;
    }

    expandable.current && expandable.current.expand()
  }, [requirementPerformances, passed])

  const checkEmptyRule = (child: React.ReactNode) => {
    if (React.isValidElement(child) && child?.props) {
      return true;
    } else {
      return false;
    }
  }

  const setRequirementPerformance = (performance: number) => {
    // We don't have to worry about adding the same Requirement's performance multiple times here because it's only called in the Requirement's constructor, which is only called once.
    setRequirementPerformances((prevRequirementPerformances: number[]) => [...prevRequirementPerformances, performance])
  }

  const { name, children: requirements, description } = props;

  if (!requirements || (Array.isArray(requirements) && !requirements.some(checkEmptyRule))) {
    return null;
  }

  return (
    <RuleContext.Provider value={setRequirementPerformance}>
      <Expandable
        element="li"
        className={passed() ? 'passed' : 'failed'}
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
                    width: `${performance() * 100}%`,
                    backgroundColor: colorForPerformance(performance()),
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
        ref={expandable}
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
      </Expandable>
    </RuleContext.Provider>
  );
}

export default Rule;
