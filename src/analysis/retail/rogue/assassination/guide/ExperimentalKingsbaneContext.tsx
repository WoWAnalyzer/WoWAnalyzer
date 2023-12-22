import useAssassinationFeatureFlag from 'analysis/retail/rogue/assassination/guide/useAssassinationFeatureFlag';
import VerticallyAlignedToggle from 'interface/VerticallyAlignedToggle';
import { createContext, ReactNode, useContext } from 'react';

interface ExperimentalKingsbaneContext {
  isExplanationEnabled: boolean;
  setExplanationEnabled: (enabled: boolean) => void;
}
const ExperimentalKingsbaneCtx = createContext<ExperimentalKingsbaneContext>({
  isExplanationEnabled: false,
  setExplanationEnabled: () => {
    // no op
  },
});

export const useExperimentalKingsbane = () => useContext(ExperimentalKingsbaneCtx);

export const ExperimentalKingsbaneToggle = () => {
  const { isExplanationEnabled, setExplanationEnabled } = useExperimentalKingsbane();

  return (
    <div className="flex">
      <div className="flex-main" />
      <div className="flex-sub">
        <VerticallyAlignedToggle
          id="experimental-kingsbane-explanation-toggle"
          enabled={isExplanationEnabled}
          setEnabled={setExplanationEnabled}
          label="Enable Kingsbane analysis"
          tooltipContent="Enabling this feature will turn on our Kingsbane analysis. It's still a work-in-progress, so don't worry too much about what it says."
        />
      </div>
    </div>
  );
};

export const ExperimentalKingsbaneContextProvider = ({ children }: { children: ReactNode }) => {
  const [isExplanationEnabled, setExplanationEnabled] = useAssassinationFeatureFlag(
    'experimental-kingsbane-explanation-enabled',
  );

  return (
    <ExperimentalKingsbaneCtx.Provider value={{ isExplanationEnabled, setExplanationEnabled }}>
      {children}
    </ExperimentalKingsbaneCtx.Provider>
  );
};

export const ExperimentalKingsbaneHider = ({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) => {
  const { isExplanationEnabled } = useExperimentalKingsbane();
  if (isExplanationEnabled) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};
