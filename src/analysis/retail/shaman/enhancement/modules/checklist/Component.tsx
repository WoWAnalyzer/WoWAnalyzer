import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import AplRule, { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import { ChecklistProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';

const EnhancementShamanChecklist = (props: ChecklistProps & AplRuleProps) => {
  const { thresholds } = props;
  return (
    <Checklist>
      <AplRule {...props} name="Single Target APL checker (beta)" />
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default EnhancementShamanChecklist;
