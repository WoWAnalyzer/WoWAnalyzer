import { useState } from 'react';

const useVdhFeatureFlag = (featureFlag: string = '', featureFlagDefault?: boolean) => {
  const sessionFeatureFlagSetting = window.sessionStorage?.getItem(
    // This will filter out if featureFlag is an empty string
    ['wowa-vdh-ff', featureFlag].filter((it) => it).join('-'),
  );
  const defaultFeatureFlagSetting = Boolean(featureFlagDefault);
  const initialFeatureFlagSetting =
    sessionFeatureFlagSetting === null
      ? defaultFeatureFlagSetting
      : Boolean(sessionFeatureFlagSetting);

  return useState(initialFeatureFlagSetting);
};

export default useVdhFeatureFlag;
