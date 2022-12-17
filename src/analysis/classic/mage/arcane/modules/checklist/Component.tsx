import SPELLS from 'common/SPELLS/classic/mage';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import { ChecklistProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const ClassicArcaneChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  return (
    <Checklist>
      <Rule
        name="Always Be Casting"
        description={
          <>
            Try to avoid downtime during the fight. When moving, use your instant abilities, such as{' '}
            <SpellLink id={SPELLS.FIRE_BLAST} /> or <SpellLink id={SPELLS.ICE_LANCE} />.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ClassicArcaneChecklist;
