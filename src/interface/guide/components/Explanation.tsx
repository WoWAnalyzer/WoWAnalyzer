import styled from '@emotion/styled';
import { ComponentPropsWithoutRef, createContext, ReactNode, use, useMemo } from 'react';
import useSessionFeatureFlag from 'interface/useSessionFeatureFlag';

interface ExplanationContextValue {
  hideExplanations: boolean;
  setHideExplanations: (p: boolean) => void;
}
const ExplanationContext = createContext<ExplanationContextValue>({
  hideExplanations: false,
  setHideExplanations: () => {
    // no-op
  },
});

interface ExplanationContextProviderProps {
  children: ReactNode;
}
export const ExplanationContextProvider = ({ children }: ExplanationContextProviderProps) => {
  const [hideExplanations, setHideExplanations] = useSessionFeatureFlag('hide-explanations');
  const providerValue = useMemo(
    () => ({ hideExplanations, setHideExplanations }),
    [hideExplanations, setHideExplanations],
  );

  return <ExplanationContext value={providerValue}>{children}</ExplanationContext>;
};

export const useExplanationContext = () => use(ExplanationContext);

/** A container for explanatory text.
 *  For now this is just a div, a future update will allow a toggle to hide all Explanations. */
const StyledExplanation = styled.div`
  .text-muted,
  small {
    color: rgba(202, 200, 196, 0.77);
  }
`;

/** A container for explanatory text. */
const Explanation = (props: ComponentPropsWithoutRef<typeof StyledExplanation>) => {
  const { hideExplanations } = useExplanationContext();
  if (hideExplanations) {
    return null;
  }
  return <StyledExplanation {...props} />;
};

export default Explanation;
