import styled from '@emotion/styled';
import { ComponentPropsWithoutRef, createContext, ReactNode, useContext } from 'react';
import useSessionFeatureFlag from 'interface/useSessionFeatureFlag';

interface ExplanationContextValue {
  hideExplanations: boolean;
  setHideExplanations: (p: boolean) => void;
}
export const ExplanationContext = createContext<ExplanationContextValue>({
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
  return (
    <ExplanationContext.Provider value={{ hideExplanations, setHideExplanations }}>
      {children}
    </ExplanationContext.Provider>
  );
};

export const useExplanationContext = () => useContext(ExplanationContext);

/** A container for explanatory text.
 *  For now this is just a div, a future update will allow a toggle to hide all Explanations. */
export const StyledExplanation = styled.div`
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
