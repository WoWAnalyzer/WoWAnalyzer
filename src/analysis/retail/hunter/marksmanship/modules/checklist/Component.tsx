import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { SpellLink } from 'interface';
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

const MarksmanshipChecklist = (props: ChecklistProps & AplRuleProps) => {
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
              href="https://www.icy-veins.com/wow/marksmanship-hunter-pve-dps-rotation-cooldowns-abilities"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.AIMED_SHOT.id} />
        <AbilityRequirement spell={SPELLS.RAPID_FIRE.id} />
        <AbilityRequirement spell={SPELLS.TRUESHOT.id} />
        <TalentCastEfficiencyRequirement talent={TALENTS_HUNTER.KILL_SHOT_SHARED_TALENT} />

        <TalentCastEfficiencyRequirement talent={TALENTS_HUNTER.EXPLOSIVE_SHOT_TALENT} />

        <TalentCastEfficiencyRequirement talent={TALENTS_HUNTER.BARRAGE_TALENT} />

        <TalentCastEfficiencyRequirement talent={TALENTS_HUNTER.VOLLEY_TALENT} />
      </Rule>

      <Rule
        name="Talent, cooldown and spell efficiency"
        description="You want to be using your baseline spells as efficiently as possible, as well as choosing the right talents for the given scenario. If a talent isn't being used optimally for the encounter, you should consider swapping to a different talent."
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.PRECISE_SHOTS.id} /> utilization
            </>
          }
          thresholds={thresholds.preciseShotsThresholds}
        />

        {combatant.hasTalent(TALENTS_HUNTER.SERPENT_STING_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_HUNTER.SERPENT_STING_TALENT.id} /> uptime
              </>
            }
            thresholds={thresholds.serpentStingUptimeThresholds}
          />
        )}

        {combatant.hasTalent(TALENTS_HUNTER.SERPENT_STING_TALENT) && (
          <Requirement
            name={
              <>
                Refreshes of <SpellLink id={TALENTS_HUNTER.SERPENT_STING_TALENT.id} /> that didn't
                pandemic{' '}
              </>
            }
            thresholds={thresholds.serpentStingNonPandemicThresholds}
          />
        )}

        {combatant.hasTalent(TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT.id} /> CDR efficiency{' '}
              </>
            }
            thresholds={thresholds.callingTheShotsThresholds}
          />
        )}

        {combatant.hasTalent(TALENTS_HUNTER.LETHAL_SHOTS_TALENT) && (
          <Requirement
            name={
              <>
                Potential <SpellLink id={TALENTS_HUNTER.LETHAL_SHOTS_TALENT.id} /> triggers when{' '}
                <SpellLink id={SPELLS.RAPID_FIRE.id} /> isn't on CD
              </>
            }
            thresholds={thresholds.lethalShotsThresholds}
          />
        )}

        {combatant.hasTalent(TALENTS_HUNTER.STEADY_FOCUS_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_HUNTER.STEADY_FOCUS_TALENT.id} /> buff uptime
              </>
            }
            thresholds={thresholds.steadyFocusThresholds}
          />
        )}
      </Rule>

      <Rule
        name="Downtime & Cancelled Casts"
        description={
          <>
            As a DPS, you should try to reduce the delay between casting spells. This is especially
            true as a Marksmanship that should be casting something all the time, because you can
            always be casting <SpellLink id={SPELLS.STEADY_SHOT.id} /> if nothing else is available.
          </>
        }
      >
        <Requirement name="Active time" thresholds={thresholds.downtimeSuggestionThresholds} />

        <Requirement name="Successful casts" thresholds={thresholds.cancelledCastsThresholds} />
      </Rule>

      <Rule
        name="Resource generators"
        description={
          <>
            Capping on Focus is a loss of potential DPS, as you could've used that Focus for a
            damaging ability at a later point. If everything is on cooldown, try and use{' '}
            {combatant.hasTalent(TALENTS_HUNTER.CHIMAERA_SHOT_TALENT) ? (
              <SpellLink id={TALENTS_HUNTER.CHIMAERA_SHOT_TALENT.id} />
            ) : (
              <SpellLink id={SPELLS.ARCANE_SHOT.id} />
            )}{' '}
            to stay off the focus cap and do some damage.
          </>
        }
      >
        <Requirement
          name="Effective Focus from generators"
          thresholds={thresholds.focusGeneratorWasteThresholds}
        />

        <Requirement
          name="Effective natural Focus regeneration"
          thresholds={thresholds.focusNaturalRegenWasteThresholds}
        />
      </Rule>

      <AplRule {...props} name="APL checker (beta)" cooldowns={[TALENTS_HUNTER.TRUESHOT_TALENT]} />
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default MarksmanshipChecklist;
