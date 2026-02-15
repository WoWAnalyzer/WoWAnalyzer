import { useState } from 'react';

const joinArrayToString = (arr: string[], separator: string) =>
  arr.filter((it) => it).join(separator);

const useSessionFeatureFlag = (featureFlag: string, featureFlagDefault = false) => {
  // eslint-disable-next-line @eslint-react/naming-convention/use-state
  const [sessionFeatureFlag, setSessionFeatureFlagState] = useState(() => {
    const sessionFeatureFlagSetting = window.sessionStorage?.getItem(
      // This will filter out if featureFlag is an empty string
      joinArrayToString(['wowa-ff', featureFlag], '-'),
    );
    return sessionFeatureFlagSetting === null
      ? featureFlagDefault
      : sessionFeatureFlagSetting.toLowerCase() === 'true';
  });
  const setSessionFeatureFlag = (value: boolean) => {
    try {
      window.sessionStorage?.setItem(
        // This will filter out if featureFlag is an empty string
        joinArrayToString(['wowa-ff', featureFlag], '-'),
        String(value),
      );
    } catch {
      // ignore it
    }
    setSessionFeatureFlagState(value);
  };

  return [sessionFeatureFlag, setSessionFeatureFlag] as const;
};

export default useSessionFeatureFlag;
