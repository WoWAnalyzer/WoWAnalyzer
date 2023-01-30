import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
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

const ArcaneMageChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Always Be Casting"
        description={
          <>
            Any time you are not casting something, that is damage that is lost. Mage has many ways
            to decrease downtime, such as using <SpellLink id={SPELLS.BLINK.id} /> to get somewhere
            faster so you can continue casting or using{' '}
            <SpellLink id={TALENTS.PRESENCE_OF_MIND_TALENT.id} /> to get a couple casts in while you
            are moving; even phases where the only target is taking 99% reduced damage is an
            opportunity to fish for <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> procs or to get
            more stacks of <SpellLink id={SPELLS.ARCANE_HARMONY_BUFF.id} /> if you are using that
            legendary. While some encounters have forced downtime, which WoWAnalyzer does not
            account for, anything you can do to minimize your downtime will help your damage.
            Additionally, to better contextualize your downtime, we recommend comparing your
            downtime to another Arcane Mage that did better than you on the same encounter with
            roughly the same kill time. If you have less downtime than them, then maybe there is
            something you can do to improve.
          </>
        }
      >
        <Requirement name="Active Time" thresholds={thresholds.downtimeSuggestionThresholds} />
        <Requirement name="Cancelled Casts" thresholds={thresholds.cancelledCasts} />
      </Rule>
      <Rule
        name="Arcane Power"
        description={
          <>
            Using your cooldown abilities as often as possible can help raise your dps
            significantly. Some help more than others, but as a general rule of thumb you should be
            looking to use most of your damaging abilities and damage cooldowns as often as possible
            unless you need to save them for a priority burst phase that is coming up soon.
          </>
        }
      >
        <AbilityRequirement spell={TALENTS.ARCANE_SURGE_TALENT.id} />
        <Requirement
          name="Arcane Power Pre-Cast Setup"
          tooltip="In order to effectively utilize Arcane Power, there are certain things you need to ensure are setup before you cast Arcane Power. Making sure you have 4 Arcane Charges, You have more than 40% Mana (Unless you have the Overpowered Talent), and ensuring you cast Touch of the Magi immediately before Arcane Power will all help make the most out of your burn phase."
          thresholds={thresholds.arcanePowerPreReqs}
        />

        <Requirement
          name="Arcane Power Active Time"
          tooltip="In order to get the most out of Arcane Power, which is a large contributor to your damage, you should ensure that you are using every second of the cooldown to cast spells and get damage out. Any time spent not casting anything during Arcane Power is a major loss of damage."
          thresholds={thresholds.arcanePowerActiveTime}
        />
        <Requirement
          name="Arcane Power Mana Mgmt."
          thresholds={thresholds.arcanePowerManaUtilization}
        />
      </Rule>
      <Rule
        name="Using your supporting spells and talents"
        description={
          <>
            As with any spec, there are additional spells, talents, and items that provide
            rotational gameplay outside of the base rotation and need to be properly utilized to get
            the most out of them. Regardless of which items and talents you pick and whether they
            are considered the best or not, it is important that you use them properly. While not
            all of them will change your rotation, or might be as simple as "use this ability on
            cooldown", they are still important to your gameplay as an Arcane Mage. Additonally, if
            you are intentionally holding a cooldown because that specific encounter or your raid
            team's strategy requires it, then you will need to take that into account when reviewing
            this information.
          </>
        }
      >
        {combatant.hasTalent(TALENTS.EVOCATION_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.EVOCATION_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.EVOCATION_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.ARCANE_ORB_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.ARCANE_ORB_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.ARCANE_ORB_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.SUPERNOVA_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.SUPERNOVA_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.SUPERNOVA_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.RUNE_OF_POWER_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.RADIANT_SPARK_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.RADIANT_SPARK_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.RADIANT_SPARK_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.RADIANT_SPARK_TALENT) && (
          <Requirement
            name="Radiant Spark not active during AP"
            tooltip="Since Radiant Spark's primary function is to boost your damage, you want to ensure that you are casting it before every Arcane Power (Radiant Spark > Touch of the Magi > Arcane Power). This way, the Arcane Blasts that you cast once Arcane Power is active can get buffed by Radiant Spark."
            thresholds={thresholds.radiantSparkPreReqs}
          />
        )}
        {combatant.hasTalent(TALENTS.RADIANT_SPARK_TALENT) && (
          <Requirement
            name="Radiant Spark Utilization"
            tooltip="Since Arcane Blast hits very hard when at 4 Arcane Charges, you should use Radiant Spark's damage increase to make Arcane Blast hit even harder. Every time you cast Radiant Spark, you should cast 5 Arcane Blasts (4 if using the Harmonic Echo/Unity Legendary) before Radiant Spark ends. Alternatively, if there are 3 or more targets, you can use Arcane Explosion, Arcane Orb, and Arcane Barrage instead of Arcane Blast."
            thresholds={thresholds.radiantSparkUtilization}
          />
        )}
        {combatant.hasTalent(TALENTS.ARCANE_HARMONY_TALENT) && (
          <Requirement
            name="Low Arcane Harmony Stacks before AP"
            tooltip="In order to get the most damage possible into your Arcane Power, you should ensure that you are at 18 stacks of Arcane Harmony before you activate Arcane Power."
            thresholds={thresholds.arcaneHarmonyPreReqs}
          />
        )}
        {combatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.SHIFTING_POWER_TALENT} /> Cast Efficiency
              </>
            }
            spell={TALENTS.SHIFTING_POWER_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT) && (
          <Requirement
            name="Average time spent inside Rune of Power"
            thresholds={thresholds.runeOfPowerBuffUptime}
            tooltip="Using Rune of Power effectively means being able to stay within the range of it for it's entire duration. If you are unable to do so or if you frequently have to move out of the range of the buff, then either plan out a more optimal time or place to be using your Rune of Power, or consider taking a different talent instead."
          />
        )}
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT) && (
          <Requirement
            name="Rune of Power overlapped casts"
            thresholds={thresholds.runeOfPowerOverlaps}
            tooltip="Casting your major cooldown (Combustion) automatically drops a Rune of Power at your feet, so you do not need to manually cast it before using Combustion. Because of this you should wait to use Rune of Power until after Combustion ends, or use it far enough before Combustion so that it will end before Combustion is cast to wasting uptime by having your runes overlapped."
          />
        )}
        {combatant.hasTalent(TALENTS.ARCANE_ECHO_TALENT) && (
          <Requirement
            name="Bad Touch of the Magi Uses"
            tooltip="Arcane Echo causes direct damage abilities, like Arcane Missiles, to pulse damage to up to 8 nearby targets. Because of this, you should be non-stop casting Arcane Missiles (whether you have Clearcasting procs or not), into any target with the Touch of the Magi debuff until that debuff is removed."
            thresholds={thresholds.arcaneEchoLowUsage}
          />
        )}
        {combatant.hasTalent(TALENTS.RULE_OF_THREES_TALENT) && (
          <Requirement
            name="Rule of Threes Buff Usage"
            tooltip="Rule of Threes gives you a free cast of Arcane Blast when you hit 3 Arcane Charges so you shoud always ensure you are using that free charge before you clear your Arcane Charges with Barrage since there is no negative mana impact to doing so."
            thresholds={thresholds.ruleOfThreesUsage}
          />
        )}
        {combatant.hasTalent(TALENTS.ARCANE_ORB_TALENT) && (
          <Requirement
            name="Missed Arcane Orbs"
            tooltip="Arcane Orb is a skillshot which means that it is important for you to aim it properly in order to get the most out of it. Therefore, on single target you should always ensure that the enemy gets hit by it, and if there are multiple enemies then you should do what you can to ensure all or most of them will get hit by the Orb as well."
            thresholds={thresholds.arcaneOrbMissedOrbs}
          />
        )}
      </Rule>
      <Rule
        name={<>Manage your mana</>}
        description={
          <>
            The biggest aspect of playing Arcane properly is managing your mana effectively.
            Essentially your mana dictates how much damage you can do and therefore needs to be
            managed properly. Things such as running out of mana during{' '}
            <SpellLink id={TALENTS.ARCANE_SURGE_TALENT.id} />, letting your mana cap out at 100% for
            too long, or ending the fight with mana remaining all have negative effects on your DPS.
          </>
        }
      >
        <Requirement name="Mana left on boss kill" thresholds={thresholds.manaOnKill} />
        {!combatant.hasTalent(TALENTS.ARCANE_HARMONY_TALENT) && (
          <Requirement
            name="Arcane Missiles only with Clearcasting"
            thresholds={thresholds.arcaneMissilesUtilization}
          />
        )}
        {combatant.hasTalent(TALENTS.TIME_ANOMALY_TALENT) && (
          <Requirement
            name="Time Anomaly Mana Mgmt."
            thresholds={thresholds.timeAnomalyManaUtilization}
          />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds}>
        <Requirement name="Arcane Intellect active" thresholds={thresholds.arcaneIntellectUptime} />
      </PreparationRule>
    </Checklist>
  );
};

export default ArcaneMageChecklist;
