import useSessionFeatureFlag from 'interface/useSessionFeatureFlag';

const useRestoFeatureFlag = (featureFlag: string, featureFlagDefault = false) => {
  return useSessionFeatureFlag(
    ['resto', featureFlag].filter((it) => it).join('-'),
    featureFlagDefault,
  );
};

export default useRestoFeatureFlag;
