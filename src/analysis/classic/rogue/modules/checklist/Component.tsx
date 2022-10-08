import Checklist from 'parser/shared/modules/features/Checklist';
import { ChecklistProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';

const DruidChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => (
  <Checklist>
    <Rule
      name="Try to avoid being inactive for a large portion of the fight"
      description={
        <>
          High downtime is something to avoid. You can reduce your downtime by reducing the delay
          between casting abilities, anticipating movement, and moving during the GCD.
        </>
      }
    >
      <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
    </Rule>
    <PreparationRule thresholds={thresholds} />
  </Checklist>
);

export default DruidChecklist;
