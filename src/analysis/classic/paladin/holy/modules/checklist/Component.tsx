import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';
import { TooltipElement } from 'interface/Tooltip';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import SPELLS from 'common/SPELLS/classic';

const HealerChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  return (
    <Checklist>
      {/* Downtime */}
      <Rule
        name="Avoid Downtime"
        description={
          <>
            Try to avoid downtime during the fight. While it may be tempting to save mana, there is
            usually something you can do to contribute to the raid. You can reduce your downtime by
            reducing the delay between casting spells, anticipating movement, moving during the GCD,
            and{' '}
            <TooltipElement content="You can ignore this while learning to heal, but contributing DPS while healing is a major part of becoming a better than average player.">
              when you're not healing try to contribute some damage.*
            </TooltipElement>
            .
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      {/* Mana */}
      <Rule
        name={
          <>
            Use <ResourceLink id={RESOURCE_TYPES.MANA.id} /> Effectively
          </>
        }
        description="Try to use all your mana during a fight. As a guideline, try to match your mana level with the boss's health."
      >
        <Requirement name="Mana left" thresholds={thresholds.manaLeft} />
      </Rule>
      {/* Cooldowns */}
      <Rule
        name="Use Cooldowns Effectively"
        description={<>Use your cooldowns as often as possible to maximize your healing output.</>}
      >
        {/* SPELLS listed here must be in ../features/Abilities */}
        <AbilityRequirement spell={SPELLS.AURA_MASTERY.id} />
        <AbilityRequirement spell={SPELLS.DIVINE_FAVOR.id} />
        <AbilityRequirement spell={SPELLS.DIVINE_SACRIFICE.id} />
        <AbilityRequirement spell={SPELLS.HOLY_SHOCK.id} />
      </Rule>
      {/* Enchants and Consumes */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default HealerChecklist;
