import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ResourceIcon } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const SurvivalChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
            need to save them for a prioirty burst phase that is coming up soon.
            {'  '}
            <a
              href="https://www.icy-veins.com/wow/survival-hunter-pve-dps-rotation-cooldowns-abilities"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.KILL_COMMAND_CAST_SV.id} />
        <AbilityRequirement spell={SPELLS.COORDINATED_ASSAULT.id} />

        {combatant.hasTalent(TALENTS.FLANKING_STRIKE_TALENT) && (
          <AbilityRequirement spell={TALENTS.FLANKING_STRIKE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.A_MURDER_OF_CROWS_TALENT) && (
          <AbilityRequirement spell={TALENTS.A_MURDER_OF_CROWS_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.WILDFIRE_INFUSION_TALENT) ? (
          <AbilityRequirement spell={TALENTS.WILDFIRE_INFUSION_TALENT.id} />
        ) : (
          <AbilityRequirement spell={SPELLS.WILDFIRE_BOMB.id} />
        )}
        {combatant.hasTalent(TALENTS.DEATH_CHAKRAM_TALENT) && (
          <AbilityRequirement spell={TALENTS.DEATH_CHAKRAM_TALENT.id} />
        )}
      </Rule>

      {combatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT) ? (
        <Rule
          name="Mongoose Bite usage"
          description={
            <>
              Using <SpellLink id={TALENTS.MONGOOSE_BITE_TALENT.id} /> properly is a key to
              achieving high dps. Maintaining high stacks of{' '}
              <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> buff from as soon as possible and casting
              as much <SpellLink id={TALENTS.MONGOOSE_BITE_TALENT.id} />s on max stacks as possible
              is considered to be most effective.
            </>
          }
        >
          <Requirement
            name={
              <>
                <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink={false} /> Average focus on{' '}
                <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> opening window{' '}
              </>
            }
            thresholds={thresholds.mongooseBiteAverageFocusThreshold}
          />
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS.MONGOOSE_BITE_TALENT.id} /> hits on max stacks of{' '}
                <SpellLink id={SPELLS.MONGOOSE_FURY.id} />{' '}
              </>
            }
            thresholds={thresholds.mongooseBite5StackHitPercentageThreshold}
          />
        </Rule>
      ) : null}

      <Rule
        name="Talent, cooldown and spell efficiency"
        description={
          <>
            You want to be using your baseline spells as efficiently as possible, as well as
            choosing the right talents for the given scenario. If a talent isn't being used
            optimally for the encounter, you should consider swapping to a different talent.
          </>
        }
      >
        {combatant.hasTalent(TALENTS.BIRDS_OF_PREY_TALENT) ? (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS.BIRDS_OF_PREY_TALENT.id} /> Effectiveness{' '}
              </>
            }
            thresholds={thresholds.birdPercentEffectiveness}
          />
        ) : null}
      </Rule>
      <Rule
        name={
          <>
            Downtime & <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink={false} /> focus capping
          </>
        }
        description={
          <>
            As a DPS, you should try to reduce the delay between casting spells, and stay off
            resource capping as much as possible. If everything is on cooldown, try and use{' '}
            {combatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT) ? (
              <SpellLink id={TALENTS.MONGOOSE_BITE_TALENT.id} />
            ) : (
              <SpellLink id={TALENTS.RAPTOR_STRIKE_TALENT.id} />
            )}{' '}
            to stay off the focus cap and do some damage.
          </>
        }
      >
        <Requirement
          name={<> Active time</>}
          thresholds={thresholds.downtimeSuggestionThresholds}
        />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default SurvivalChecklist;
