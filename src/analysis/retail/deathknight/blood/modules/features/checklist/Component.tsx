import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
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

const BloodDeathKnightChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use your short cooldowns"
        description="These should generally always be recharging to maximize efficiency."
      >
        <AbilityRequirement spell={TALENTS.BLOOD_BOIL_TALENT.id} />
        {combatant.hasTalent(TALENTS.RAPID_DECOMPOSITION_TALENT) && !false && (
          <AbilityRequirement spell={SPELLS.DEATH_AND_DECAY.id} />
        )}
        {combatant.hasTalent(TALENTS.BLOODDRINKER_TALENT) && (
          <AbilityRequirement spell={TALENTS.BLOODDRINKER_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.RAPID_DECOMPOSITION_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={SPELLS.CRIMSON_SCOURGE_TALENT_BUFF} /> procs spent
              </>
            }
            thresholds={thresholds.crimsonScourge}
          />
        )}
      </Rule>
      <Rule
        name="Do not overcap your resources"
        description="Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities. Try to spend Runic Power before reaching the maximum amount and always keep atleast 3 Runes on cooldown to avoid wasting resources."
      >
        <Requirement name="Runic Power Efficiency" thresholds={thresholds.runicPower} />
        <Requirement name="Rune Efficiency" thresholds={thresholds.runes} />
        <Requirement
          name={
            <>
              <SpellLink spell={TALENTS.MARROWREND_TALENT} /> Efficiency
            </>
          }
          thresholds={thresholds.marrowrend}
        />
        <Requirement
          name={
            <>
              <SpellLink spell={TALENTS.DEATHS_CARESS_TALENT} /> Efficiency
            </>
          }
          thresholds={thresholds.deathsCaress}
        />
      </Rule>
      <Rule
        name="Use your offensive cooldowns"
        description="You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value."
      >
        <AbilityRequirement spell={TALENTS.DANCING_RUNE_WEAPON_TALENT.id} />
        {combatant.hasTalent(TALENTS.CONSUMPTION_TALENT) && (
          <Requirement
            name={
              <>
                Possible <SpellLink spell={TALENTS.CONSUMPTION_TALENT} /> Hits
              </>
            }
            thresholds={thresholds.consumption}
          />
        )}
        {combatant.hasTalent(TALENTS.BONESTORM_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.BONESTORM_TALENT} /> Efficiency
              </>
            }
            thresholds={thresholds.bonestorm}
          />
        )}
      </Rule>
      <Rule
        name="Maintain your buffs and debuffs"
        description="It is important to maintain these as they contribute a large amount to your DPS and HPS."
      >
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.BLOOD_PLAGUE} /> Uptime
            </>
          }
          thresholds={thresholds.bloodPlague}
        />
        {combatant.hasTalent(TALENTS.MARK_OF_BLOOD_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.MARK_OF_BLOOD_TALENT} /> Uptime
              </>
            }
            thresholds={thresholds.markOfBlood}
          />
        )}
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.BONE_SHIELD} /> Uptime
            </>
          }
          thresholds={thresholds.boneShield}
        />
        <Requirement
          name={
            <>
              <SpellLink spell={TALENTS.OSSUARY_TALENT} /> Efficiency
            </>
          }
          thresholds={thresholds.ossuary}
        />
      </Rule>
      <Rule
        name="Use your defensive cooldowns"
        description="Use these to block damage spikes and keep damage smooth to reduce external healing required."
      >
        <AbilityRequirement spell={TALENTS.VAMPIRIC_BLOOD_TALENT.id} />
        <AbilityRequirement spell={TALENTS.ICEBOUND_FORTITUDE_TALENT.id} />
        <AbilityRequirement spell={TALENTS.ANTI_MAGIC_SHELL_TALENT.id} />
        {combatant.hasTalent(TALENTS.RUNE_TAP_TALENT) && (
          <AbilityRequirement spell={TALENTS.RUNE_TAP_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.TOMBSTONE_TALENT) && (
          <AbilityRequirement spell={TALENTS.TOMBSTONE_TALENT.id} />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default BloodDeathKnightChecklist;
