import useSessionFeatureFlag from 'interface/useSessionFeatureFlag';

const useVdhFeatureFlag = (featureFlag: string, featureFlagDefault: boolean = false) => {
  return useSessionFeatureFlag(
    ['vdh', featureFlag].filter((it) => it).join('-'),
    featureFlagDefault,
  );
};

export default useVdhFeatureFlag;
