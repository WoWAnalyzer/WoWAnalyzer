import Checklist from 'parser/shared/modules/features/Checklist';
import { ChecklistProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import PreparationRule from 'parser/tbc/modules/features/Checklist/PreperationRule';
import React from 'react';

const PriestChecklist = ({ thresholds }: ChecklistProps) => (
  <Checklist>
    <PreparationRule thresholds={thresholds} />
  </Checklist>
);

export default PriestChecklist;
