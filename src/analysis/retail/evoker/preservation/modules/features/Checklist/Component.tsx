import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const PreservationEvokerChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  return (
    <Checklist>
      <Rule
        name="Don't overcap Essence"
        description={
          <>
            Abilities that cost essence like <SpellLink id={SPELLS.EMERALD_BLOSSOM.id} /> are very
            powerful and are a core part of your healing as a Preservation Evoker. Make sure you are
            not overcapping on Essence too often.
          </>
        }
      >
        <Requirement name="Essence Wasted" thresholds={thresholds.essenceDetails} />
      </Rule>
      <Rule
        name="Use core abilities as often as possible"
        description="Aim to keep core rotational abilities on cooldown to maximize healing"
      >
        <AbilityRequirement
          spell={
            combatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_TALENT)
              ? SPELLS.DREAM_BREATH_FONT.id
              : TALENTS_EVOKER.DREAM_BREATH_TALENT.id
          }
        />
        {combatant.hasTalent(TALENTS_EVOKER.SPIRITBLOOM_TALENT) && (
          <AbilityRequirement
            spell={
              combatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_TALENT)
                ? SPELLS.SPIRITBLOOM_FONT.id
                : TALENTS_EVOKER.SPIRITBLOOM_TALENT.id
            }
          />
        )}
        {combatant.hasTalent(TALENTS_EVOKER.GRACE_PERIOD_TALENT) && (
          <AbilityRequirement spell={TALENTS_EVOKER.REVERSION_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Use your cooldowns effectively"
        description="Try to use your powerful raid cooldowns effectively"
      >
        {combatant.hasTalent(TALENTS_EVOKER.DREAM_FLIGHT_TALENT) && (
          <Requirement
            name={
              <>
                % of group hit with <SpellLink id={TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id} />
              </>
            }
            thresholds={thresholds.dreamFlight}
          />
        )}
      </Rule>
      <Rule
        name="Use rotational spells based on talent selection"
        description={
          <>
            Certain talents empower your abilities to enhance your healing, try to utilize your
            rotational spells more often for these benefits. For example, you should cast{' '}
            <SpellLink id={SPELLS.LIVING_FLAME_CAST.id} /> frequently when talented into{' '}
            <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id} />.
          </>
        }
      >
        {combatant.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id} /> buffs applied
              </>
            }
            thresholds={thresholds.essenceBurstBuffApplies}
          ></Requirement>
        )}
        {combatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT) && (
          <Requirement
            name={
              <>
                Wasted <SpellLink id={TALENTS_EVOKER.CALL_OF_YSERA_TALENT} /> buffs
              </>
            }
            thresholds={thresholds.callOfYsera}
          />
        )}
      </Rule>
      <Rule
        name="Use your procs and short CDs"
        description="Make sure to use your procs and spells at the correct time."
      >
        {combatant.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_TALENT) && (
          <Requirement
            name={
              <>
                Wasted <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id} /> stacks
              </>
            }
            thresholds={thresholds.essenceBurst}
          />
        )}
        <Requirement
          name={
            <>
              Wasted <SpellLink id={TALENTS_EVOKER.ECHO_TALENT.id} /> buffs
            </>
          }
          thresholds={thresholds.echo}
        />
      </Rule>
      <Rule
        name="Maximize targets hit by AoE abilities"
        description={
          <>
            Try to hit as many targets as possible with AoE spells such as{' '}
            <SpellLink id={SPELLS.EMERALD_BLOSSOM.id} /> and{' '}
            <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id} />
          </>
        }
      >
        <Requirement
          name={
            <>
              Average targets hit by <SpellLink id={SPELLS.EMERALD_BLOSSOM.id} />
            </>
          }
          thresholds={thresholds.emeraldBlossom}
        />
        <Requirement
          name={
            <>
              Average targets hit by
              <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id} />
            </>
          }
          thresholds={thresholds.dreamBreath}
        />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default PreservationEvokerChecklist;
