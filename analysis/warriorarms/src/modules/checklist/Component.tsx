import React from 'react';


import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import { AbilityRequirementProps, ChecklistProps, DotUptimeProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';

const ArmWarriorChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
        name="Use core abilities and offensive cooldowns as often as possible"
        description={(
          <>
            Spells such as <SpellLink id={SPELLS.COLOSSUS_SMASH.id} /> (or <SpellLink id={SPELLS.WARBREAKER_TALENT.id} /> if talented), <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> and <SpellLink id={SPELLS.OVERPOWER.id} /> are your most efficient spells available, try to cast them as much as possible.
            Keep in mind that it is sometimes more useful to keep <SpellLink id={SPELLS.BLADESTORM.id} /> (or <SpellLink id={SPELLS.RAVAGER_TALENT_ARMS.id} />) and use it when several targets are present in the fight. &nbsp;
            <a href="https://www.wowhead.com/arms-warrior-rotation-guide" target="_blank" rel="noopener noreferrer">More info.</a>
          </>
        )}
      >
        <AbilityRequirement spell={combatant.hasTalent(SPELLS.WARBREAKER_TALENT.id) ? SPELLS.WARBREAKER_TALENT.id : SPELLS.COLOSSUS_SMASH.id} />
        <AbilityRequirement spell={combatant.hasTalent(SPELLS.RAVAGER_TALENT_ARMS.id) ? SPELLS.RAVAGER_TALENT_ARMS.id : SPELLS.BLADESTORM.id} />
        {combatant.hasTalent(SPELLS.SKULLSPLITTER_TALENT.id) && <AbilityRequirement spell={SPELLS.SKULLSPLITTER_TALENT.id} />}
        <AbilityRequirement spell={SPELLS.OVERPOWER.id} />
        {combatant.hasTalent(SPELLS.AVATAR_TALENT.id) && <AbilityRequirement spell={SPELLS.AVATAR_TALENT.id} />}
        {combatant.hasTalent(SPELLS.REND_TALENT.id) && <DotUptime id={SPELLS.REND_TALENT.id} thresholds={thresholds.rend} />}
        {combatant.hasTalent(SPELLS.DEADLY_CALM_TALENT.id) && <AbilityRequirement spell={SPELLS.DEADLY_CALM_TALENT.id} />}
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && <AbilityRequirement spell={SPELLS.ANCIENT_AFTERSHOCK.id} />}
        {combatant.hasCovenant(COVENANTS.KYRIAN.id) && <AbilityRequirement spell={SPELLS.SPEAR_OF_BASTION.id} />}
        {combatant.hasCovenant(COVENANTS.NECROLORD.id) && <AbilityRequirement spell={SPELLS.CONQUERORS_BANNER.id} />}
      </Rule>

      <Rule
        name={(<>Use <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> efficiently</>)}
        description={(
          <>
            You should cast <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> as much as possible when the target is above 20% (or 35% with <SpellLink id={SPELLS.MASSACRE_TALENT_ARMS.id} />) . It should only be used during the execution phase to refresh <SpellLink id={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id} icon /> as <SpellLink id={SPELLS.EXECUTE.id} /> is more rage efficient than Mortal Strike.
          </>
        )}
      >
		<Requirement
          name={(<><SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> outside execution phase</>)}
          thresholds={thresholds.goodMortalStrike}
        />
		<Requirement
          name={(<><SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> which should have been <SpellLink id={SPELLS.EXECUTE.id} icon /></>)}
          thresholds={thresholds.tooMuchMortalStrike}
        />
		<Requirement
          name={(<><SpellLink id={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id} icon /> refreshed with <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> during execution phase</>)}
          thresholds={thresholds.notEnoughMortalStrike}
        />
      </Rule>
      <Rule
        name="Use your defensive cooldowns"
        description="While you shouldn't cast these defensives on cooldown, be aware of them and use them whenever effective. Not using them at all indicates you might not be aware of them or not using them optimally."
      >
        <AbilityRequirement spell={SPELLS.DIE_BY_THE_SWORD.id} />
        <AbilityRequirement spell={SPELLS.RALLYING_CRY.id} />
      </Rule>
      <Rule
        name="Avoid downtime"
        description={(
          <>
            As a melee DPS, it is important to stay within range of the target and cast your abilities promptly. If you find yourself out of range, try using <SpellLink id={SPELLS.CHARGE.id} /> and <SpellLink id={SPELLS.HEROIC_LEAP.id} /> to get back more quickly.
          </>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ArmWarriorChecklist;
