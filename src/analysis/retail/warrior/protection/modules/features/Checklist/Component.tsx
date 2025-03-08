import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import TALENTS from 'common/TALENTS/warrior';
import TalentCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/TalentCastEfficiencyRequirement';

const ProtectionWarriorChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Rotational Spells"
        description={
          <>
            Be sure to use <SpellLink spell={SPELLS.SHIELD_SLAM} /> and{' '}
            <SpellLink spell={TALENTS.THUNDER_CLAP_TALENT} /> on cooldown to maximise your{' '}
            <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> generation and damage output.
            <br /> <SpellLink spell={SPELLS.REVENGE} /> can be used to avoid rage capping and{' '}
            <SpellLink spell={SPELLS.DEVASTATE} /> should only be used when every other spell
            mentioned here is on cooldown.
          </>
        }
      >
        <AbilityRequirement spell={TALENTS.THUNDER_CLAP_TALENT.id} />
        <Requirement
          name={<SpellLink spell={SPELLS.SHIELD_SLAM} />}
          thresholds={thresholds.shieldSlam}
        />
        <AbilityRequirement spell={SPELLS.SHIELD_BLOCK.id} />
        <Requirement
          name={
            <>
              Effective <SpellLink spell={SPELLS.SHIELD_BLOCK} /> Casts{' '}
            </>
          }
          thresholds={thresholds.shieldBlock}
        />
        {combatant.hasTalent(TALENTS.BOOMING_VOICE_TALENT) &&
          combatant.hasTalent(TALENTS.DEMORALIZING_SHOUT_TALENT) && (
            <AbilityRequirement spell={SPELLS.DEMORALIZING_SHOUT.id} />
          )}
      </Rule>

      <Rule
        name="Defensive Cooldowns"
        description={
          <>
            Protection warriors have a multitude of defensive spells on a fairly short cooldown. Be
            sure to use these to further mitigate incoming damage.
          </>
        }
      >
        <TalentCastEfficiencyRequirement talent={TALENTS.SHIELD_WALL_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.LAST_STAND_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.BITTER_IMMUNITY_TALENT} />
        <Requirement
          name={
            <>
              Magic damage with <SpellLink spell={SPELLS.SPELL_REFLECTION} />
            </>
          }
          thresholds={thresholds.spellReflect}
        />
        {!combatant.hasTalent(TALENTS.BOOMING_VOICE_TALENT) &&
          combatant.hasTalent(TALENTS.DEMORALIZING_SHOUT_TALENT) && (
            <AbilityRequirement spell={SPELLS.DEMORALIZING_SHOUT.id} />
          )}
      </Rule>

      <Rule
        name="Offensive Cooldowns"
        description={
          <>
            Using <SpellLink spell={TALENTS.AVATAR_TALENT} /> as often as possible is very important
            because it will increase your overall damage a lot and provides 10{' '}
            <ResourceLink id={RESOURCE_TYPES.RAGE.id} />.<br /> If you are also using{' '}
            <SpellLink spell={TALENTS.UNSTOPPABLE_FORCE_TALENT} /> remember that{' '}
            <SpellLink spell={TALENTS.THUNDER_CLAP_TALENT} /> will have a reduced cooldown so you
            can use it every other GCD.
          </>
        }
      >
        <TalentCastEfficiencyRequirement talent={TALENTS.AVATAR_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.DEMORALIZING_SHOUT_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.RAVAGER_TALENT} />
        {combatant.hasTalent(TALENTS.RAVAGER_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.RAVAGER_TALENT} /> Effective Hits
              </>
            }
            thresholds={thresholds.ravagerHitCheck}
          />
        )}
        <TalentCastEfficiencyRequirement talent={TALENTS.SHIELD_CHARGE_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.CHAMPIONS_SPEAR_TALENT} />
        {combatant.hasTalent(TALENTS.THUNDEROUS_ROAR_TALENT) && (
          <AbilityRequirement spell={TALENTS.THUNDEROUS_ROAR_TALENT.id} />
        )}
      </Rule>

      <Rule
        name="Don't get too angry"
        description={
          <>
            Minimizing your wasted <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> should be top
            priority as a protection warrior so be sure to use{' '}
            <SpellLink spell={TALENTS.IGNORE_PAIN_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.REVENGE_TALENT} /> to avoid this.
          </>
        }
      >
        <Requirement name="Lost Rage" thresholds={thresholds.rageDetails} />
      </Rule>

      <Rule
        name="Utility"
        description={
          <>
            Warriors main raid utility comes from <SpellLink spell={TALENTS.RALLYING_CRY_TALENT} />{' '}
            - it should be used on high damage spikes to help people survive.
          </>
        }
      >
        {combatant.hasTalent(TALENTS.RALLYING_CRY_TALENT) && (
          <AbilityRequirement spell={SPELLS.RALLYING_CRY.id} />
        )}
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ProtectionWarriorChecklist;
