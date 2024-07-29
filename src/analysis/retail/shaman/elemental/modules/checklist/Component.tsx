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
        {combatant.hasTalent(TALENTS.STORMKEEPER_TALENT) && (
          <AbilityRequirement spell={SPELLS.STORMKEEPER_BUFF_AND_CAST.id} />
        )}
        {combatant.hasTalent(TALENTS.LIQUID_MAGMA_TOTEM_TALENT) && (
          <AbilityRequirement spell={TALENTS.LIQUID_MAGMA_TOTEM_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT) && (
          <AbilityRequirement spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Minimize Downtime"
        description={
          <>
            Downtime is the time where you are not casting and not GCD locked. Ensure you are
            casting as much as possible by avoiding movement when you could be casting. Elemental
            shaman has many GCDs available from <SpellLink spell={TALENTS.EARTH_SHOCK_TALENT} />,{' '}
            <SpellLink spell={SPELLS.LAVA_SURGE} /> empowered{' '}
            <SpellLink spell={TALENTS.LAVA_BURST_TALENT} />
            s, <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} />, and others that help you move
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
            <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> will crit and to allow for{' '}
            <SpellLink spell={SPELLS.LAVA_SURGE} /> procs. Applying{' '}
            <SpellLink spell={SPELLS.FLAME_SHOCK} /> itself doesn't do much damage so you should
            only refresh it with 30% (about 7 seconds) or less of it's total duration remaining to
            beneift from pandemic.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.FLAME_SHOCK} /> uptime
            </>
          }
          thresholds={thresholds.flameShockUptime}
        />
        <Requirement
          name={
            <>
              {' '}
              Bad <SpellLink spell={SPELLS.FLAME_SHOCK} /> refreshes{' '}
            </>
          }
          thresholds={thresholds.flameShockRefreshes}
        />
      </Rule>
      {combatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) && (
        <Rule
          name="Spam Lava Burst"
          description={
            <>
              <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} />
              's damage comes from maximising the number of{' '}
              <SpellLink spell={TALENTS.LAVA_BURST_TALENT} />
              's cast during it's duration. Only use <SpellLink
                spell={TALENTS.LAVA_BURST_TALENT}
              />{' '}
              and{' '}
              <SpellLink
                spell={
                  combatant.hasTalent(TALENTS.EARTH_SHOCK_TALENT)
                    ? TALENTS.EARTH_SHOCK_TALENT
                    : TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT
                }
              />{' '}
              while it is up. Use <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> as much as you
              can. Only use{' '}
              <SpellLink
                spell={
                  combatant.hasTalent(TALENTS.EARTH_SHOCK_TALENT)
                    ? TALENTS.EARTH_SHOCK_TALENT
                    : TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT
                }
              />{' '}
              when you need to spend Malestrom.
            </>
          }
        >
          <Requirement
            name={
              <>
                "Wrong" Casts within <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} />{' '}
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
