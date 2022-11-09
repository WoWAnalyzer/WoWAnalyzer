import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ResourceIcon } from 'interface';
import { SpellIcon } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import AplRule, { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import TalentCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/TalentCastEfficiencyRequirement';

const BeastMasteryChecklist = (props: ChecklistProps & AplRuleProps) => {
  const { combatant, castEfficiency, thresholds } = props;
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
              href="https://www.icy-veins.com/wow/beast-mastery-hunter-pve-dps-rotation-cooldowns-abilities"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.KILL_COMMAND_CAST_BM.id} />
        <AbilityRequirement spell={SPELLS.BARBED_SHOT.id} />
        <AbilityRequirement spell={SPELLS.BESTIAL_WRATH.id} />

        <TalentCastEfficiencyRequirement talent={TALENTS.ASPECT_OF_THE_WILD_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.DIRE_BEAST_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.BARRAGE_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.STAMPEDE_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS.BLOODSHED_TALENT} />
      </Rule>
      <Rule
        name="Barbed Shot usage"
        description={
          <>
            Using <SpellLink id={SPELLS.BARBED_SHOT.id} /> properly is a key to achieving high dps.
            This means maintaining the pet buff from <SpellLink id={SPELLS.BARBED_SHOT.id} /> as
            long as possible, and using it to reduce the cooldown of{' '}
            <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> as much as possible, to ensure high uptime on{' '}
            <SpellLink id={SPELLS.BESTIAL_WRATH.id} />.
          </>
        }
      >
        <Requirement
          name={
            <>
              Uptime of <SpellLink id={SPELLS.BARBED_SHOT_PET_BUFF.id} />{' '}
            </>
          }
          thresholds={thresholds.frenzyUptimeSuggestionThreshold}
        />
        <Requirement
          name={
            <>
              3 stack uptime of <SpellLink id={SPELLS.BARBED_SHOT_PET_BUFF.id} />{' '}
            </>
          }
          thresholds={thresholds.frenzy3StackSuggestionThreshold}
        />
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> CDR Efficiency
            </>
          }
          thresholds={thresholds.bestialWrathCDREfficiencyThreshold}
        />
      </Rule>
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
        <Requirement
          name={
            <>
              <SpellIcon id={SPELLS.COBRA_SHOT.id} />
              <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} icon={false} /> CDR efficiency
            </>
          }
          thresholds={thresholds.cobraShotCDREfficiencyThreshold}
        />
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.COBRA_SHOT.id} /> casts when{' '}
              <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> wasn't on cd
            </>
          }
          thresholds={thresholds.wastedCobraShotsThreshold}
        />
        <Requirement
          name={
            <>
              <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink={false} /> Average focus on{' '}
              <SpellIcon id={SPELLS.BESTIAL_WRATH.id} /> cast{' '}
            </>
          }
          thresholds={thresholds.bestialWrathFocusThreshold}
        />
        <Requirement
          name={<> Lost pet Basic Attacks </>}
          thresholds={thresholds.basicAttackThresholds}
        />
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.BEAST_CLEAVE_BUFF.id} /> applications with 0 cleaves
            </>
          }
          thresholds={thresholds.beastCleaveThresholds}
        />
        {combatant.hasTalent(TALENTS.KILLER_COBRA_TALENT.id) && (
          <Requirement
            name={
              <>
                {' '}
                Wasted <SpellLink id={TALENTS.KILLER_COBRA_TALENT.id} /> resets{' '}
              </>
            }
            thresholds={thresholds.wastedKillerCobraThreshold}
          />
        )}
      </Rule>
      <Rule
        name="Legendaries"
        description="The throughput gain of some legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly, even after trying to improve your usage of said legendary."
      >
        {combatant.hasLegendary(SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT.id} /> Kill Command Reset
                Efficiency
              </>
            }
            thresholds={thresholds.qaplaEfficiencyThreshold}
          />
        )}
      </Rule>
      <Rule
        name="Downtime & resource generators"
        description={
          <>
            As a DPS, you should try to reduce the delay between casting spells, and stay off
            resource capping as much as possible. If everything is on cooldown, try and use{' '}
            <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap and do some damage.
          </>
        }
      >
        <Requirement name="Active time" thresholds={thresholds.downtimeSuggestionThresholds} />
        <Requirement
          name="Effective Focus from generators"
          thresholds={thresholds.focusGeneratorWasteThresholds}
        />
        <Requirement
          name="Effective Focus from natural regen"
          thresholds={thresholds.focusNaturalRegenWasteThresholds}
        />
      </Rule>
      <AplRule
        {...props}
        name="APL checker (beta)"
        cooldowns={[SPELLS.BESTIAL_WRATH, SPELLS.ASPECT_OF_THE_WILD, SPELLS.WILD_SPIRITS]}
      />
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default BeastMasteryChecklist;
