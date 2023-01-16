import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
//import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import AplRule, { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const ArmsWarriorChecklist = ({
  combatant,
  castEfficiency,
  thresholds,
  apl,
  checkResults,
}: ChecklistProps & AplRuleProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <AplRule
        apl={apl}
        checkResults={checkResults}
        castEfficiency={castEfficiency}
        name="Rotation Efficiency"
        cooldowns={[
          SPELLS.COLOSSUS_SMASH,
          TALENTS.WARBREAKER_TALENT,
          TALENTS.AVATAR_TALENT,
          SPELLS.ANCIENT_AFTERSHOCK,
          SPELLS.SPEAR_OF_BASTION,
          SPELLS.CONQUERORS_BANNER,
        ]}
        description={
          <div style={{ color: 'white' }}>
            Warrior has a simple rotation. That does not mean the class is trivial to play. Small
            mistakes will compound themselves and result in a large final DPS loss. Use the graphic
            below to see if you are making small rotational mistakes.
            <strong> NOTE:</strong> The priority list below does not include{' '}
            <SpellLink id={TALENTS.REND_ARMS_TALENT.id} icon />
            <br />
          </div>
        }
      />
      {!false && (
        <Rule
          name={
            <>
              Use <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> efficiently
            </>
          }
          description={
            //removed: <SpellLink id={SPELLS.MASSACRE_TALENT_ARMS.id} />) . It should only be used during the
            //execution phase to refresh{' '}
            <>
              You should cast <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> as much as possible
              when the target is above 20% (or 35% with{' '}
              <SpellLink id={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id} icon /> as{' '}
              <SpellLink id={SPELLS.EXECUTE.id} /> is more rage efficient than Mortal Strike.
            </>
          }
        >
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> outside execution phase
              </>
            }
            thresholds={thresholds.goodMortalStrike}
          />
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> which should have been{' '}
                <SpellLink id={SPELLS.EXECUTE.id} icon />
              </>
            }
            thresholds={thresholds.tooMuchMortalStrike}
          />
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id} icon /> refreshed with{' '}
                <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> during execution phase
              </>
            }
            thresholds={thresholds.notEnoughMortalStrike}
          />
        </Rule>
      )}
      <Rule
        name="Use your defensive cooldowns"
        description="While you shouldn't cast these defensives on cooldown, be aware of them and use them whenever effective. Not using them at all indicates you might not be aware of them or not using them optimally."
      >
        <AbilityRequirement spell={SPELLS.DIE_BY_THE_SWORD.id} />
        <AbilityRequirement spell={SPELLS.RALLYING_CRY.id} />
      </Rule>
      <Rule
        name="Avoid downtime"
        description={
          <>
            As a melee DPS, it is important to stay within range of the target and cast your
            abilities promptly. If you find yourself out of range, try using{' '}
            <SpellLink id={SPELLS.CHARGE.id} /> and <SpellLink id={SPELLS.HEROIC_LEAP.id} /> to get
            back more quickly.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ArmsWarriorChecklist;
