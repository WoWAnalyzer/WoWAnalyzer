import { AplProblemData, ViolationExplainer } from '../claims';

type SelectedExplanation<T> = {
  describer: ViolationExplainer<T>['describe'];
  claimData: AplProblemData<T>;
};

export default SelectedExplanation;
