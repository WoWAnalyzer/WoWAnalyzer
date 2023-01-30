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
            Be sure to use <SpellLink id={SPELLS.SHIELD_SLAM.id} /> and{' '}
            <SpellLink id={SPELLS.THUNDER_CLAP.id} /> on cooldown to maximise your{' '}
            <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> generation and damage output.
            <br /> <SpellLink id={SPELLS.REVENGE.id} /> can be used to avoid rage capping and{' '}
            <SpellLink id={SPELLS.DEVASTATE.id} /> should only be used when every other spell
            mentioned here is on cooldown.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.THUNDER_CLAP.id} />
        <Requirement
          name={<SpellLink id={SPELLS.SHIELD_SLAM.id} />}
          thresholds={thresholds.shieldSlam}
        />
        <AbilityRequirement spell={SPELLS.SHIELD_BLOCK.id} />
        <Requirement
          name={
            <>
              Effective <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> Casts{' '}
            </>
          }
          thresholds={thresholds.shieldBlock}
        />
        {combatant.hasTalent(TALENTS.BOOMING_VOICE_TALENT) &&
          combatant.hasTalent(TALENTS.DEMORALIZING_SHOUT_TALENT) && (
            <AbilityRequirement spell={SPELLS.DEMORALIZING_SHOUT.id} />
          )}
        {combatant.hasTalent(TALENTS.THUNDEROUS_ROAR_TALENT) && (
          <AbilityRequirement spell={TALENTS.THUNDEROUS_ROAR_TALENT.id} />
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
              Magic damage with <SpellLink id={SPELLS.SPELL_REFLECTION.id} />
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
            Using <SpellLink id={TALENTS.AVATAR_PROTECTION_TALENT.id} /> as often as possible is
            very important because it will increase your overall damage a lot and provides 30{' '}
            <ResourceLink id={RESOURCE_TYPES.RAGE.id} />.<br /> If you are also using{' '}
            <SpellLink id={TALENTS.UNSTOPPABLE_FORCE_TALENT.id} /> remember that{' '}
            <SpellLink id={TALENTS.THUNDER_CLAP_PROTECTION_TALENT.id} /> will have a reduced
            cooldown so you can use it every other GCD.
          </>
        }
      >
        <TalentCastEfficiencyRequirement talent={TALENTS.AVATAR_PROTECTION_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.DEMORALIZING_SHOUT_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.RAVAGER_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.SHIELD_CHARGE_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.SPEAR_OF_BASTION_TALENT} />
        {combatant.hasTalent(TALENTS.SONIC_BOOM_TALENT) && (
          <AbilityRequirement spell={TALENTS.SHOCKWAVE_TALENT.id} />
        )}
      </Rule>

      <Rule
        name="Don't get too angry"
        description={
          <>
            Minimizing your wasted <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> should be top
            priority as a protection warrior so be sure to use{' '}
            <SpellLink id={TALENTS.IGNORE_PAIN_TALENT.id} /> and{' '}
            <SpellLink id={TALENTS.REVENGE_TALENT.id} /> to avoid this.
          </>
        }
      >
        <Requirement name="Lost Rage" thresholds={thresholds.rageDetails} />
      </Rule>

      <Rule
        name="Utility"
        description={
          <>
            Warriors main raid utility comes from <SpellLink id={TALENTS.RALLYING_CRY_TALENT.id} />{' '}
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
