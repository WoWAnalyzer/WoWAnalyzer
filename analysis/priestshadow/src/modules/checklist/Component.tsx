import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

import COVENANTS from 'game/shadowlands/COVENANTS';
import { AbilityRequirementProps, ChecklistProps, DotUptimeProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';

const ShadowPriestChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const DotUptime = (props: DotUptimeProps) => (
    <Requirement
      name={(<><SpellLink id={props.id} icon /> uptime</>)}
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
        name="Maintain your DoTs on the boss"
        description={(
          <React.Fragment>
            When not in <SpellLink id={SPELLS.VOIDFORM.id} />, it's important to keep your DoTs up on the boss. While in <SpellLink id={SPELLS.VOIDFORM.id} />, your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} />, <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} />, and <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> durations are extended when the target or a nearby target gets hit by <SpellLink id={SPELLS.VOID_BOLT.id} />.
          </React.Fragment>
        )}
      >
        <DotUptime id={SPELLS.SHADOW_WORD_PAIN.id} thresholds={thresholds.shadowWordPain} />
        <DotUptime id={SPELLS.VAMPIRIC_TOUCH.id} thresholds={thresholds.vampiricTouch} />

      </Rule>

      <Rule
        name="Use core spells as often as possible"
        description={(
          <React.Fragment>
            Spells such as <SpellLink id={SPELLS.VOID_BOLT.id} /> or <SpellLink id={SPELLS.MIND_BLAST.id} /> are your most important spells. Try to cast them as much as possible.
          </React.Fragment>
        )}
      >
        <AbilityRequirement spell={SPELLS.VOID_BOLT.id} />
        <AbilityRequirement spell={SPELLS.MIND_BLAST.id} />
        <AbilityRequirement spell={SPELLS.SHADOW_WORD_DEATH.id} />

        {combatant.hasTalent(SPELLS.VOID_TORRENT_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.VOID_TORRENT_TALENT.id} />
        )}

        {combatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SHADOW_CRASH_TALENT.id} />
        )}

      </Rule>

      <Rule
        name="Use cooldowns effectively"
        description={(
          <React.Fragment>
            Cooldowns are an important part of your rotation, you should be using them as often as possible.
          </React.Fragment>
        )}
      >
        <AbilityRequirement spell={SPELLS.VOID_ERUPTION.id} />
        <AbilityRequirement spell={SPELLS.POWER_INFUSION.id} />

        {combatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SURRENDER_TO_MADNESS_TALENT.id} />
        )}

        {combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id) ?
          <AbilityRequirement spell={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> :
          <AbilityRequirement spell={SPELLS.SHADOWFIEND.id} />
        }

        {combatant.hasCovenant(COVENANTS.NECROLORD.id) && (
          <AbilityRequirement spell={SPELLS.UNHOLY_NOVA.id} />
        )}

        {combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
          <AbilityRequirement spell={SPELLS.BOON_OF_THE_ASCENDED.id} />
        )}

        {combatant.hasCovenant(COVENANTS.VENTHYR.id) && (
          <AbilityRequirement spell={SPELLS.MINDGAMES.id} />
        )}

        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <AbilityRequirement spell={SPELLS.FAE_GUARDIANS.id} />
        )}
      </Rule>

      <Rule
        name="Insanity generation"
        description={(
          <>
            Insanity generation and management is crucial to maximizing your damage. You should always try to stay below maximum insanity for room to generate more with your abilities. You should juggle using <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} /> to not overcap while also maximizing DOT uptime for the increased mastery benefit from <SpellLink id={SPELLS.MASTERY_SHADOW_WEAVING.id} />.
          </>
        )}>
          <Requirement name="Insanity Overcapping" thresholds={thresholds.insanityUsage} />
      </Rule>

      <Rule
        name="Minimize casting downtime"
        description={(
          <React.Fragment>
            Try to minimize your time not casting. Use your core spells on cooldown and fillers when they are not available. If you know you have an upcoming position requirement, stutterstep with each <SpellLink id={SPELLS.VOID_BOLT.id} /> or <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} /> cast towards that location. During high movement you can use <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> or <SpellLink id={SPELLS.SHADOW_WORD_DEATH.id} /> as a filler.
          </React.Fragment>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ShadowPriestChecklist;
