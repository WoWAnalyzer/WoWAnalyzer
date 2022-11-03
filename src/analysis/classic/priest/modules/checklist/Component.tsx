import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import { TooltipElement } from 'interface/Tooltip';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps, DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';

import * as SPELLS from '../../SPELLS';
import { Build } from 'analysis/classic/priest/CONFIG';

const PriestChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => {
  const DotUptime = (props: DotUptimeProps) => (
    <Requirement
      name={
        <>
          <SpellLink id={props.id} icon /> uptime
        </>
      }
      thresholds={props.thresholds}
    />
  );

  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use core abilities as often as possible"
        description={
          <>
            Using your core abilities as often as possible will typically result in better
            performance.
            {combatant.owner.build !== Build.SHADOW &&
              <>
                <SpellLink id={SPELLS.PRAYER_OF_MENDING} /> should be used on cooldown any
                time that you don't have 5 stacks up on a tank.
              </>
            }
          </>
        }
      >
        {combatant.owner.build !== Build.SHADOW && <AbilityRequirement spell={SPELLS.PRAYER_OF_MENDING} />}
        {combatant.owner.build === Build.HOLY && <AbilityRequirement spell={SPELLS.CIRCLE_OF_HEALING} />}
      </Rule>
      {combatant.owner.build === Build.SHADOW && <Rule
        name="Maintain your DoTs on the boss"
        description={<>DoTs are a big part of your damage. You should try to keep as high uptime on them as possible, but do not refresh them too early.
          Try to cast <SpellLink id={SPELLS.SHADOW_WORD_PAIN} /> after applying 5 stacks of <SpellLink id={SPELLS.SHADOW_WEAVING_TALENT} /></>}
      >
        <DotUptime id={SPELLS.SHADOW_WORD_PAIN} thresholds={thresholds.shadowWordPain} />
        <DotUptime id={SPELLS.VAMPIRIC_TOUCH} thresholds={thresholds.vampiricTouch} />
        <DotUptime id={SPELLS.DEVOURING_PLAGUE} thresholds={thresholds.devouringPlague} />
      </Rule>}

      <Rule
        name="Use cooldowns effectively"
        description={
          <>
            Wrath doesn't have as many cooldowns as retails, but they still play an important part of
            optimizing your play. <SpellLink id={SPELLS.SHADOW_FIEND} /> should be used any time you
            are below 70% mana, and If you spec into <SpellLink id={SPELLS.PAIN_SUPPRESSION} />,{' '}
            <SpellLink id={SPELLS.POWER_INFUSION} />, or <SpellLink id={SPELLS.INNER_FOCUS} />, you
            should try and use them as often as possible.
          </>
        }
      >
        {(combatant.owner.build === Build.HOLY || combatant.owner.build === Build.DISC) &&
          <>
            <AbilityRequirement spell={SPELLS.DIVINE_HYMN} />
            <AbilityRequirement spell={SPELLS.HYMN_OF_HOPE} />
          </>
        }
        {combatant.owner.build === Build.DISC &&
          <>
            <AbilityRequirement spell={SPELLS.POWER_INFUSION} />
            <AbilityRequirement spell={SPELLS.INNER_FOCUS} />
            <AbilityRequirement spell={SPELLS.PAIN_SUPPRESSION} />
          </>
        }
        {combatant.owner.build === Build.HOLY &&
          <>
            <AbilityRequirement spell={SPELLS.GUARDIAN_SPIRIT} />
          </>
        }
        <AbilityRequirement spell={SPELLS.SHADOW_FIEND} />

      </Rule>
      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={
          <>
            High downtime is inexcusable, while it may be tempting to not cast and save mana,
            wanding is free. If you have a Paladin keeping <SpellLink id={20354} /> on an enemy,
            wanding can even give mana back! You can reduce your downtime by reducing the delay
            between casting spells, anticipating movement, moving during the GCD, and{' '}
            <TooltipElement content="You can ignore this while learning to heal, but contributing DPS whilst healing is a major part of becoming a better than average player.">
              when you're not healing try to contribute some damage.*
            </TooltipElement>
            .
          </>
        }
      >
        {(combatant.owner.build === Build.HOLY || combatant.owner.build === Build.DISC) &&
          <Requirement
            name="Non healing time"
            thresholds={thresholds.nonHealingTimeSuggestionThresholds}
          />
        }
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      {(combatant.owner.build === Build.HOLY || combatant.owner.build === Build.DISC) &&
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
      }
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default PriestChecklist;
