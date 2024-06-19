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

const FireMageChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
            to decrease downtime, such as using <SpellLink spell={SPELLS.BLINK} /> to get somewhere
            faster so you can continue casting or using <SpellLink spell={SPELLS.SCORCH} /> while
            you are moving; even phases where the only target is taking 99% reduced damage is an
            opportunity to fish for procs or get cooldown reduction from crits if you are using{' '}
            <SpellLink spell={TALENTS.KINDLING_TALENT} />. While some encounters have forced
            downtime, which WoWAnalyzer does not account for, anything you can do to minimize your
            downtime will help your damage. Additionally, to better contextualize your downtime, we
            recommend comparing your downtime to another Fire Mage that did better than you on the
            same encounter with roughly the same kill time. If you have less downtime than them,
            then maybe there is something you can do to improve.
          </>
        }
      >
        <Requirement name="Active Time" thresholds={thresholds.downtimeSuggestionThresholds} />
        <Requirement name="Cancelled Casts" thresholds={thresholds.cancelledCasts} />
      </Rule>
      <Rule
        name="Combustion"
        description={
          <>
            As a Fire Mage, the vast majority if your damage is going to come from{' '}
            <SpellLink spell={TALENTS.COMBUSTION_TALENT} />. Therefore it is critical that you do
            everything you can to get the most out of{' '}
            <SpellLink spell={TALENTS.COMBUSTION_TALENT} />, including getting the most out of
            abilities that empower <SpellLink spell={TALENTS.COMBUSTION_TALENT} />. This not only
            includes the abilities you use during <SpellLink spell={TALENTS.COMBUSTION_TALENT} />,
            but also pooling resources, like <SpellLink spell={SPELLS.FIRE_BLAST} /> and{' '}
            <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} />, before{' '}
            <SpellLink spell={TALENTS.COMBUSTION_TALENT} />.
          </>
        }
      >
        <AbilityRequirement
          name={
            <>
              <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> Cast Efficiency
            </>
          }
          spell={TALENTS.COMBUSTION_TALENT.id}
        />
        <Requirement
          name="Fireball casts during Combustion"
          thresholds={thresholds.fireballSpellUsageDuringCombustion}
          tooltip="Due to Combustion's short duration, you should only cast Fireball during Combustion if your haste is over 100% or you have a Flame Accelerant proc (if talented). Instead, you should use your instant cast abilities like Fireblast and Phoenix Flames. If you run out of instant abilities, cast Scorch instead since it's cast time is shorter."
        />
        <Requirement
          name="Combustion Active time"
          tooltip="In order to get the most out of Combustion, which is a large contributor to your damage, you should ensure that you are using every second of the cooldown to cast spells and get damage out. Any time spent not casting anything during Combustion is a major loss of damage."
          thresholds={thresholds.combustionActiveTime}
        />
        <Requirement
          name="Avg. Combustion Pre-Cast Delay (seconds)"
          tooltip="In order to get a head start on your Combustion cooldown, it is recommended to pre-cast an ability (like Fireball) and activate Combustion during that pre-cast. In order to minimize the delay after you activate Combustion, and to prevent losing a GCD during Combustion, it is recommended that you activate Combustion within the last 0.7 seconds of that pre-cast ability. If you do not want to adjust your gameplay or if you cannot accomplish this due to latency, you can tell RaidBots to use a different delay value by entering apl_variable.combustion_cast_remains=value (where value is the delay in seconds ... i.e. 1.1 or 0.9) in the Custom APL section."
          thresholds={thresholds.combustionPreCastDelay}
        />
        {combatant.hasTalent(TALENTS.METEOR_TALENT) && (
          <Requirement
            name="Meteor Utilization During Combustion"
            thresholds={thresholds.meteorCombustionUtilization}
            tooltip="In order to get the most out of your Combustion, you should always cast Meteor during Combustion. If Meteor will not come off cooldown before Combustion, then you should save Meteor for Combustion."
          />
        )}
        {combatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT) && (
          <Requirement
            name="Feel the Burn uptime at max stacks"
            tooltip="When using the Feel the Burn talent, you need to adjust your Combustion rotation so that you can get to 3 stacks of Feel the Burn as soon as possible, and stay at 3 stacks for the entire duration of Combustion. To accomplish this, once you get to 3 stacks of Feel the Burn, alternate between using Phoenix Flames and Fire Blast to get Hot Streak until Combustion has ended. This way you are able to refresh Feel the Burn throughout Combustion instead of using all your Fire Blast charges first and then letting the buff expire while you use your Phoenix Flames charges."
            thresholds={thresholds.feelTheBurnMaxStacks}
          />
        )}
      </Rule>
      <Rule
        name="Heating Up and Hot Streak"
        description={
          <>
            Fire Mage revolves almost entirely around the buffs{' '}
            <SpellLink spell={SPELLS.HEATING_UP} /> and <SpellLink spell={SPELLS.HOT_STREAK} />, so
            it is very important that you understand how these procs work. Essentially, when you get
            a crit with a direct damage ability, like <SpellLink spell={SPELLS.FIREBALL} /> or{' '}
            <SpellLink spell={TALENTS.PYROBLAST_TALENT} />, you will get a{' '}
            <SpellLink spell={SPELLS.HEATING_UP} /> proc. If you get a second consecutive crit with
            a direct damage ability, you will get a <SpellLink spell={SPELLS.HOT_STREAK} /> proc
            which makes your next <SpellLink spell={TALENTS.PYROBLAST_TALENT} /> or{' '}
            <SpellLink spell={SPELLS.FLAMESTRIKE} /> cast be instant cast. Additionally, you have
            spells like <SpellLink spell={SPELLS.FIRE_BLAST} /> which is always guaranteed to crit
            and spells like <SpellLink spell={SPELLS.SCORCH} /> which are guaranteed to crit when
            the target is below 30% health (If you are using the Searing Touch talent). These can be
            used to force <SpellLink spell={SPELLS.HOT_STREAK} /> procs.
          </>
        }
      >
        <Requirement
          name="Hot Streak procs used"
          thresholds={thresholds.hotStreakUtilization}
          tooltip="This is the percentage of your Hot Streak procs that were successfully spent without expiring or being overwritten. The bulk of your rotation revolves around successfully converting Heating Up procs into Hot Streak and using those Hot Streak procs effectively. Unless it is unavoidable, you should never let your Hot Streak procs expire without using them."
        />
        <Requirement
          name="Wasted crits during Hot Streak"
          thresholds={thresholds.hotStreakWastedCrits}
          tooltip="In addition to converting Heating Up to Hot Streak, it is also very important to use your Hot Streak procs quickly. This is primarily because you are unable to get a Heating Up proc if you already have Hot Streak. Therefore, dealing damage with abilities that can give you Heating Up while you have Hot Streak would be a big waste as those crits could have contributed towards your next Hot Streak instead."
        />
        <Requirement
          name="Precasting before using Hot Streak"
          thresholds={thresholds.hotStreakPreCasts}
          tooltip="Unless you are in Combustion and have Fire Blast/Phoenix Flames charges, you should always cast an ability that can generate Heating Up before using your Hot Streak proc. As an example, if you have Hot Streak, you should start casting Fireball (or Scorch if you have Searing Touch and the target is under 30%) and then use your Hot Streak by pressing Pyroblast right at the end of the Fireball cast. This way, if one of the two spells crits, you will get a new Heating Up ... and if both spells crit, you will instantly get a new Hot Streak."
        />
        <Requirement
          name="Fire Blast Usage"
          thresholds={thresholds.fireBlastHeatingUpUsage}
          tooltip="Since Fire Blast is always guaranteed to crit, you should only be using it to convert Heating Up into Hot Streak or if you have a buff like Firestarter, Combustion, or Searing Touch where you know that the other spells you are casting will crit and give you the Hot Streak."
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
            cooldown", they are still important to your gameplay as a Fire Mage. Additonally, if you
            are intentionally holding a cooldown because that specific encounter or your raid team's
            strategy requires it, then you will need to take that into account when reviewing this
            information.
          </>
        }
      >
        <AbilityRequirement
          name={
            <>
              <SpellLink spell={SPELLS.FIRE_BLAST} /> Cast Efficiency
            </>
          }
          spell={SPELLS.FIRE_BLAST.id}
        />
        <AbilityRequirement
          name={
            <>
              <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} /> Cast Efficiency
            </>
          }
          spell={TALENTS.PHOENIX_FLAMES_TALENT.id}
        />
        {combatant.hasTalent(TALENTS.METEOR_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.METEOR_TALENT} />
              </>
            }
            thresholds={thresholds.meteorEfficiency}
          />
        )}
        {combatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT) && (
          <Requirement
            name="Shifting Power proper usage"
            thresholds={thresholds.shiftingPowerUsage}
            tooltip="Using Shifting Power, and channeling it for the entire duration, will reduce the cooldown on all your abilities by a decent amount. Because of the number of short cooldowns Fire Mage has, you should ensure you are getting the most out of it by reducing as many cooldowns as possible. Specifically, it is important that you only use Shifting Power if both Combustion and Rune of Power are on cooldown, as this will allow you to get more uses of both of those abilities and will help increase your damage."
          />
        )}
        {combatant.hasTalent(TALENTS.IMPROVED_SCORCH_TALENT) && (
          <Requirement
            name="Improved Scorch Uptime"
            thresholds={thresholds.improvedScorchUptime}
            tooltip="While the target is under 30% health, it is very important that you maintain the damage buff from Improved Scorch for as much of your execute as possible. The buff stacks up to 3 times and is a large boost to your damage to maintain this buff."
          />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds}>
        <Requirement name="Arcane Intellect active" thresholds={thresholds.arcaneIntellectUptime} />
      </PreparationRule>
    </Checklist>
  );
};

export default FireMageChecklist;
