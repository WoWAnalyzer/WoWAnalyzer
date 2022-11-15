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
            to decrease downtime, such as using <SpellLink id={SPELLS.BLINK.id} /> to get somewhere
            faster so you can continue casting or using <SpellLink id={SPELLS.SCORCH.id} /> while
            you are moving; even phases where the only target is taking 99% reduced damage is an
            opportunity to fish for procs or get cooldown reduction from crits if you are using{' '}
            <SpellLink id={TALENTS.KINDLING_TALENT.id} />. While some encounters have forced
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
            <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />. Therefore it is critical that you do
            everything you can to get the most out of{' '}
            <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />, including getting the most out of
            abilities that empower <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />. This not only
            includes the abilities you use during <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />,
            but also pooling resources, like <SpellLink id={SPELLS.FIRE_BLAST.id} /> and{' '}
            <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} />, before{' '}
            <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />.
          </>
        }
      >
        <AbilityRequirement
          name={
            <>
              <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> Cast Efficiency
            </>
          }
          spell={TALENTS.COMBUSTION_TALENT.id}
        />
        <Requirement
          name="Pooling Fire Blast Charges"
          thresholds={thresholds.fireBlastCombustionCharges}
          tooltip="When Combustion is about 25-30 seconds away from coming off cooldown, unless you are going to hold Combustion for something, it is important to stop using your Fire Blast charges so you can pool them for Combustion. At a minimum, you want to go into Combustion with 2 Fire Blast charges available, preferably with the third about to come off cooldown (Assuming you are using Flame On)."
        />
        <Requirement
          name="Pooling Phoenix Flames Charges"
          thresholds={thresholds.phoenixFlamesCombustionCharges}
          tooltip="When outside of Combustion, you should avoid using your Phoenix Flames charges so that they have time to come off cooldown before Combustion is available again. Typically, the only time you want to use a Phoenix Flames charge outside of Combustion is if you are capped on charges or are about to cap and will not be casting Combustion soon."
        />
        <Requirement
          name="Fireball casts during Combustion"
          thresholds={thresholds.fireballSpellUsageDuringCombustion}
          tooltip="Due to Combustion's short duration, you should never cast Fireball during Combustion. Instead, you should use your instant cast abilities like Fireblast and Phoenix Flames. If you run out of instant abilities, cast Scorch instead since it's cast time is shorter."
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
        {combatant.hasTalent(TALENTS.METEOR_TALENT.id) && (
          <Requirement
            name="Meteor Utilization During Combustion"
            thresholds={thresholds.meteorCombustionUtilization}
            tooltip="In order to get the most out of your Combustion, you should always cast Meteor during Combustion. If Meteor will not come off cooldown before Combustion, then you should save Meteor for Combustion."
          />
        )}
        {combatant.hasConduitBySpellID(SPELLS.INFERNAL_CASCADE.id) && (
          <Requirement
            name="Infernal Cascade uptime at max stacks"
            tooltip="When using the Infernal Cascade conduit, you need to adjust your Combustion rotation so that you can get to 2 stacks of Infernal Cascade as soon as possible, and stay at 2 stacks for the entire duration of Combustion. To accomplish this, once you get to 2 stacks of Infernal Cascade, alternate between using Phoenix Flames and Fire Blast to get Hot Streak until Combustion has ended. This way you are able to refresh Infernal Cascade throughout Combustion instead of using all your Fire Blast charges first and then letting the buff expire while you use your Phoenix Flames charges."
            thresholds={thresholds.infernalCascadeMaxStacks}
          />
        )}
      </Rule>
      <Rule
        name="Heating Up and Hot Streak"
        description={
          <>
            Fire Mage revolves almost entirely around the buffs{' '}
            <SpellLink id={SPELLS.HEATING_UP.id} /> and <SpellLink id={SPELLS.HOT_STREAK.id} />, so
            it is very important that you understand how these procs work. Essentially, when you get
            a crit with a direct damage ability, like <SpellLink id={SPELLS.FIREBALL.id} /> or{' '}
            <SpellLink id={TALENTS.PYROBLAST_TALENT.id} />, you will get a{' '}
            <SpellLink id={SPELLS.HEATING_UP.id} /> proc. If you get a second consecutive crit with
            a direct damage ability, you will get a <SpellLink id={SPELLS.HOT_STREAK.id} /> proc
            which makes your next <SpellLink id={TALENTS.PYROBLAST_TALENT.id} /> or{' '}
            <SpellLink id={TALENTS.FLAMESTRIKE_TALENT.id} /> cast be instant cast. Additionally, you
            have spells like <SpellLink id={SPELLS.FIRE_BLAST.id} /> which is always guaranteed to
            crit and spells like <SpellLink id={SPELLS.SCORCH.id} /> which are guaranteed to crit
            when the target is below 30% health (If you are using the{' '}
            <SpellLink id={TALENTS.SEARING_TOUCH_TALENT.id} /> talent). These can be used to force{' '}
            <SpellLink id={SPELLS.HOT_STREAK.id} /> procs.
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
              <SpellLink id={SPELLS.FIRE_BLAST.id} /> Cast Efficiency
            </>
          }
          spell={SPELLS.FIRE_BLAST.id}
        />
        <AbilityRequirement
          name={
            <>
              <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} /> Cast Efficiency
            </>
          }
          spell={TALENTS.PHOENIX_FLAMES_TALENT.id}
        />
        {combatant.hasTalent(TALENTS.BLAST_WAVE_TALENT.id) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.BLAST_WAVE_TALENT.id} /> Cast Efficiency
              </>
            }
            spell={TALENTS.BLAST_WAVE_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT.id) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT.id} /> Cast Efficiency
              </>
            }
            spell={TALENTS.RUNE_OF_POWER_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.LIVING_BOMB_TALENT.id) && (
          <AbilityRequirement
            name={
              <>
                <SpellLink id={TALENTS.LIVING_BOMB_TALENT.id} /> Cast Efficiency
              </>
            }
            spell={TALENTS.LIVING_BOMB_TALENT.id}
          />
        )}
        {combatant.hasTalent(TALENTS.METEOR_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS.METEOR_TALENT.id} />
              </>
            }
            thresholds={thresholds.meteorEfficiency}
          />
        )}
        {combatant.hasTalent(TALENTS.PYROCLASM_TALENT.id) && (
          <Requirement
            name="Pyroclasm procs used"
            thresholds={thresholds.pyroclasmUtilization}
            tooltip="Pyroclasm has a chance to give you a buff that makes your next non instant Pyroblast deal 225% additional damage. You should ensure that you are using these procs (especially during Combustion) somewhat quickly to ensure you dont waste or overwrite any of these procs."
          />
        )}
        {combatant.hasTalent(TALENTS.SEARING_TOUCH_TALENT.id) && (
          <Requirement
            name="Spell usage during Searing Touch"
            thresholds={thresholds.searingTouchUtilization}
            tooltip="Searing Touch causes Scorch to deal 150% additional damage and be guaranteed to crit when the target is under 30% health. Therefore it is important that when the target is under 30% health, you cast Scorch instead of Fireball."
          />
        )}
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT.id) && (
          <Requirement
            name="Average time spent inside Rune of Power"
            thresholds={thresholds.runeOfPowerBuffUptime}
            tooltip="Using Rune of Power effectively means being able to stay within the range of it for it's entire duration. If you are unable to do so or if you frequently have to move out of the range of the buff, then either plan out a more optimal time or place to be using your Rune of Power, or consider taking a different talent instead."
          />
        )}
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT.id) && (
          <Requirement
            name="Rune of Power overlapped casts"
            thresholds={thresholds.runeOfPowerOverlaps}
            tooltip="Casting your major cooldown (Combustion) automatically drops a Rune of Power at your feet, so you do not need to manually cast it before using Combustion. Because of this you should wait to use Rune of Power until after Combustion ends, or use it far enough before Combustion so that it will end before Combustion is cast to wasting uptime by having your runes overlapped."
          />
        )}
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT.id) &&
          combatant.hasTalent(TALENTS.METEOR_TALENT.id) && (
            <Requirement
              name="Meteor Overall Utilization"
              thresholds={thresholds.meteorUtilization}
              tooltip="In order to get the most out of your Meteor casts, you should only cast Meteor while you are buffed by Rune of Power."
            />
          )}
        {combatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT.id) && (
          <Requirement
            name="Shifting Power proper usage"
            thresholds={thresholds.shiftingPowerUsage}
            tooltip="Using Shifting Power, and channeling it for the entire duration, will reduce the cooldown on all your abilities by a decent amount. Because of the number of short cooldowns Fire Mage has, you should ensure you are getting the most out of it by reducing as many cooldowns as possible. Specifically, it is important that you only use Shifting Power if both Combustion and Rune of Power are on cooldown, as this will allow you to get more uses of both of those abilities and will help increase your damage."
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
