import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
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
          TALENTS.AVATAR_SHARED_TALENT,
          TALENTS.THUNDEROUS_ROAR_TALENT,
          SPELLS.BLADESTORM,
        ]}
        description={
          <div style={{ color: 'white' }}>
            Warrior has a simple rotation. That does not mean the class is trivial to play. Small
            mistakes will compound themselves and result in a large final DPS loss. Use the graphic
            below to see if you are making small rotational mistakes.
            <br />
            <strong> NOTE:</strong> The priority list below does not include{' '}
            <SpellLink spell={TALENTS.REND_ARMS_TALENT} icon />
            <br />
          </div>
        }
      />
      {!false && (
        <Rule
          name={
            <>
              Use <SpellLink spell={SPELLS.MORTAL_STRIKE} /> efficiently
            </>
          }
          description={
            <>
              Try to use as many <SpellLink spell={SPELLS.MORTAL_STRIKE} icon /> as possible. It is
              generally your strongest hitting ability, unless you are in{' '}
              <SpellLink spell={SPELLS.EXECUTE} /> range and do not have the{' '}
              <SpellLink spell={TALENTS.EXECUTIONERS_PRECISION_TALENT} /> talent. Especially with
              the 4-set bonus in Season 1 of Dragonflight, where keeping up your buff up is
              important.
            </>
          }
        >
          <Requirement
            name={
              <>
                <SpellLink spell={SPELLS.MORTAL_STRIKE} icon /> uses
              </>
            }
            thresholds={thresholds.mortalStrikeUsage}
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
            <SpellLink spell={SPELLS.CHARGE} /> and <SpellLink spell={SPELLS.HEROIC_LEAP} /> to get
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
