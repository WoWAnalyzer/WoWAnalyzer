import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';
import { TooltipElement } from 'interface/Tooltip';
import Checklist from 'parser/shared/modules/features/Checklist';
import { ChecklistProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';

const PaladinChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => (
  <Checklist>
    <Rule
      name="Try to avoid being inactive for a large portion of the fight"
      description={
        <>
          High downtime is something to avoid. While it may be tempting to not cast and save mana,
          there is usually something you can do to contribute to the raid. You can reduce your
          downtime by reducing the delay between casting spells, anticipating movement, moving
          during the GCD, and{' '}
          <TooltipElement content="You can ignore this while learning Resto, but contributing DPS whilst healing is a major part of becoming a better than average player.">
            when you're not healing try to contribute some damage.*
          </TooltipElement>
          .
        </>
      }
    >
      <Requirement
        name="Non healing time"
        thresholds={thresholds.nonHealingTimeSuggestionThresholds}
      />
      <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
    </Rule>

    <Rule
      name={
        <>
          Use all of your <ResourceLink id={RESOURCE_TYPES.MANA.id} /> effectively
        </>
      }
      description="If you have a large amount of mana left at the end of the fight that's mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss's health."
    >
      <Requirement name="Mana left" thresholds={thresholds.manaLeft} />
    </Rule>

    <PreparationRule thresholds={thresholds} />
  </Checklist>
);

export default PaladinChecklist;
