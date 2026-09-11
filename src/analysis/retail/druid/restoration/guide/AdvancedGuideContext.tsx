import useRestoFeatureFlag from 'analysis/retail/druid/restoration/guide/useRestoFeatureFlag';
import VerticallyAlignedToggle from 'interface/VerticallyAlignedToggle';
import { createContext, ReactNode, useContext, useMemo } from 'react';

interface AdvancedGuideContextValue {
  isAdvanced: boolean;
  setIsAdvanced: (enabled: boolean) => void;
}

const AdvancedGuideCtx = createContext<AdvancedGuideContextValue>({
  isAdvanced: false,
  setIsAdvanced: () => {
    // no op
  },
});

export const useAdvancedGuide = () => useContext(AdvancedGuideCtx);

export const AdvancedGuideToggle = () => {
  const { isAdvanced, setIsAdvanced } = useAdvancedGuide();

  return (
    <div className="flex">
      <div className="flex-main" />
      <div className="flex-sub">
        <VerticallyAlignedToggle
          id="resto-advanced-guide-toggle"
          enabled={isAdvanced}
          setEnabled={setIsAdvanced}
          label="Advanced"
          tooltipContent="Shows extra cast analysis and talent-specific sections for experienced players. Leave this off if you're learning the spec."
        />
      </div>
    </div>
  );
};

export const AdvancedGuideContextProvider = ({ children }: { children: ReactNode }) => {
  const [isAdvanced, setIsAdvanced] = useRestoFeatureFlag('advanced-guide', false);
  const providerValue = useMemo(() => ({ isAdvanced, setIsAdvanced }), [isAdvanced, setIsAdvanced]);

  return <AdvancedGuideCtx.Provider value={providerValue}>{children}</AdvancedGuideCtx.Provider>;
};
