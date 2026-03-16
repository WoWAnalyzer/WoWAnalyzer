import { clsx } from 'clsx';
import { ComponentPropsWithoutRef, createContext, ReactNode, use, useMemo } from 'react';
import useSessionFeatureFlag from 'interface/useSessionFeatureFlag';

import styles from './Explanation.module.scss';

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

/** A container for explanatory text. */
const Explanation = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => {
  const { hideExplanations } = useExplanationContext();
  if (hideExplanations) {
    return null;
  }
  return <div {...props} className={clsx(styles.explanation, className)} />;
};

export default Explanation;
