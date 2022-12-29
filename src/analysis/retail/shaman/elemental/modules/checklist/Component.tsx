import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
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

const ElementalShamanChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use core abilities as often as possible"
        description={
          <>
            Using your core abilities as often as possible can help raise your dps significantly.
            Some help more than others, but as a general rule of thumb you should be looking to use
            most of your damaging abilities and damage cooldowns as often as possible, unless you
            need to save them for a priority burst phase that is coming up soon.{' '}
            <a
              href="https://stormearthandlava.com/guide/general/priority_list.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        {combatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) && (
          <AbilityRequirement spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id} />
        )}
        {!combatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT) && (
          <AbilityRequirement spell={TALENTS.FIRE_ELEMENTAL_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT) && (
          <AbilityRequirement spell={TALENTS.STORM_ELEMENTAL_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.ICEFURY_TALENT) && (
          <AbilityRequirement spell={TALENTS.ICEFURY_TALENT.id} />
        )}
        {(combatant.hasTalent(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT) ||
          combatant.hasTalent(TALENTS.STORMKEEPER_2_ELEMENTAL_TALENT)) && (
          <AbilityRequirement spell={TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.LIQUID_MAGMA_TOTEM_TALENT) && (
          <AbilityRequirement spell={TALENTS.LIQUID_MAGMA_TOTEM_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.ELEMENTAL_BLAST_TALENT) && (
          <AbilityRequirement spell={TALENTS.ELEMENTAL_BLAST_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Minimize Downtime"
        description={
          <>
            Downtime is the time where you are not casting and not GCD locked. Ensure you are
            casting as much as possible by avoiding movement when you could be casting. Elemental
            shaman has many GCDs available from <SpellLink id={TALENTS.EARTH_SHOCK_TALENT.id} />,{' '}
            <SpellLink id={SPELLS.LAVA_SURGE.id} /> empowered{' '}
            <SpellLink id={TALENTS.LAVA_BURST_TALENT.id} />
            s, <SpellLink id={TALENTS.FROST_SHOCK_TALENT.id} />, and others that help you move
            towards your location without incurring downtime. Additionally, cancelled casts
            contribute significantly as they fill a GCD without actually doing damage. It's expected
            that some casts will need to be cancelled due to mechanics, but proper planning can help
            mitigate that.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
        <Requirement name="Cancelled casts" thresholds={thresholds.cancelledCasts} />
      </Rule>
      <Rule
        name="Maintain your flame shock"
        description={
          <>
            It's important to maintain flame shock on your target to guarantee{' '}
            <SpellLink id={TALENTS.LAVA_BURST_TALENT.id} /> will crit and to allow for{' '}
            <SpellLink id={SPELLS.LAVA_SURGE.id} /> procs. Applying{' '}
            <SpellLink id={SPELLS.FLAME_SHOCK.id} /> itself doesn't do much damage so you should
            only refresh it with 30% (about 7 seconds) or less of it's total duration remaining to
            beneift from pandemic.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime
            </>
          }
          thresholds={thresholds.flameShockUptime}
        />
        <Requirement
          name={
            <>
              {' '}
              Bad <SpellLink id={SPELLS.FLAME_SHOCK.id} /> refreshes{' '}
            </>
          }
          thresholds={thresholds.flameShockRefreshes}
        />
      </Rule>
      {combatant.hasTalent(TALENTS.ICEFURY_TALENT) && (
        <Rule
          name="Utilize all Icefury Stacks"
          description={
            <>
              <SpellLink id={TALENTS.ICEFURY_TALENT.id} />
              's damage component itself is not a strong spell so it's important to fully utilize
              the talent by consuming all 4 <SpellLink id={TALENTS.ICEFURY_TALENT.id} /> buff stacks
              with <SpellLink id={TALENTS.FROST_SHOCK_TALENT.id} /> casts during the buff's
              duration.
              {combatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT) && (
                <>
                  {' '}
                  While you should try to buff as many <SpellLink
                    id={TALENTS.ICEFURY_TALENT.id}
                  />{' '}
                  empowered <SpellLink id={TALENTS.FROST_SHOCK_TALENT.id} /> as you can with{' '}
                  <SpellLink id={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT.id} />, it is far more
                  important to actually use all 4 charges before the buff expires.
                </>
              )}
            </>
          }
        >
          <Requirement
            name={
              <>
                Average <SpellLink id={TALENTS.FROST_SHOCK_TALENT.id} /> Casts within{' '}
                <SpellLink id={TALENTS.ICEFURY_TALENT.id} /> Duration
              </>
            }
            thresholds={thresholds.icefuryEfficiency}
          />
        </Rule>
      )}
      {combatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) && (
        <Rule
          name="Spam Meatballs(Lava Burst)"
          description={
            <>
              <SpellLink id={TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id} />
              's damage comes from spamming <SpellLink id={TALENTS.LAVA_BURST_TALENT.id} /> during
              it's duration. Only use <SpellLink id={TALENTS.LAVA_BURST_TALENT.id} /> and{' '}
              <SpellLink id={TALENTS.EARTH_SHOCK_TALENT.id} /> while it is up.
              {combatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) && (
                <>
                  {' '}
                  Use <SpellLink id={TALENTS.LAVA_BURST_TALENT.id} /> as much as you can. Only use{' '}
                  <SpellLink id={TALENTS.EARTH_SHOCK_TALENT.id} /> when you need to spend
                  Malestrom..
                </>
              )}
            </>
          }
        >
          <Requirement
            name={
              <>
                "Wrong" Casts within <SpellLink id={TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id} />{' '}
                Duration
              </>
            }
            thresholds={thresholds.ascendanceEfficiency}
          />
        </Rule>
      )}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ElementalShamanChecklist;
