import styled from '@emotion/styled';
import { formatPercentage } from 'common/format';
import React, { useContext } from 'react';
import { AplProblemData, ViolationExplainer } from './claims';
import PassFailBar from 'interface/guide/components/PassFailBar';
import { SelectedExplanation } from './types';

type Props<T> = {
  claimData: AplProblemData<T>;
  describer: ViolationExplainer<T>['describe'];
  children: React.ReactChild;
  totalViolations: number;
};

const EmbedContainer = styled.div`
  background: #222;
  border-radius: 0.5em;
  padding: 1em 1.5em;
  display: grid;
  grid-gap: 2rem;
  grid-template-columns: 1fr max-content;
  align-content: center;
  align-items: center;
`;

const ShowMeButton = styled.button`
  appearance: none;
  background: #333;
  border-radius: 0.5rem;
  padding: 1rem;
  border: none;
  box-shadow: 1px 1px 3px #111;

  &:hover {
    filter: brightness(120%);
  }
`;

const ClaimCountBar = styled(PassFailBar)`
  .pass-bar {
    background-color: hsl(348.9, 69.5%, 39.8%);
  }

  .fail-bar {
    background-color: hsl(0, 0%, 20%);
  }
`;

const ClaimCountDescription = styled.div`
  display: grid;
  grid-template-columns: max-content auto;
  grid-gap: 1rem;
  align-items: start;
`;

export const ExplanationSelectionContext = React.createContext<
  (selection: SelectedExplanation<any>) => void
>(() => undefined);

function AplViolationExplanation<T = any>({
  claimData,
  describer,
  children,
  totalViolations,
}: Props<T>) {
  const setSelection = useContext(ExplanationSelectionContext);

  return (
    <EmbedContainer>
      <div>
        {children}
        <ClaimCountDescription>
          <small>{formatPercentage(claimData.claims.size / totalViolations, 0)}% of mistakes</small>{' '}
          <ClaimCountBar pass={claimData.claims.size} total={totalViolations} />
        </ClaimCountDescription>
      </div>
      <ShowMeButton onClick={() => setSelection?.({ describer, claimData })}>Show Me!</ShowMeButton>
    </EmbedContainer>
  );
}

export default AplViolationExplanation;
