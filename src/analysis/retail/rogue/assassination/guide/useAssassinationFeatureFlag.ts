import useSessionFeatureFlag from 'interface/useSessionFeatureFlag';

const useAssassinationFeatureFlag = (featureFlag: string, featureFlagDefault: boolean = false) => {
  return useSessionFeatureFlag(
    ['sin', featureFlag].filter((it) => it).join('-'),
    featureFlagDefault,
  );
};

export default useAssassinationFeatureFlag;
