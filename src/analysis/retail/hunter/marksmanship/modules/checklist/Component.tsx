import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
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
import TalentCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/TalentCastEfficiencyRequirement';

const MarksmanshipChecklist = (props: ChecklistProps) => {
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
        <TalentCastEfficiencyRequirement talent={TALENTS_HUNTER.AIMED_SHOT_TALENT} />
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
              <SpellLink spell={SPELLS.PRECISE_SHOTS} /> utilization
            </>
          }
          thresholds={thresholds.preciseShotsThresholds}
        />

        {combatant.hasTalent(TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT} /> CDR efficiency{' '}
              </>
            }
            thresholds={thresholds.callingTheShotsThresholds}
          />
        )}

        {combatant.hasTalent(TALENTS_HUNTER.STEADY_FOCUS_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS_HUNTER.STEADY_FOCUS_TALENT} /> buff uptime
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
            always be casting <SpellLink spell={SPELLS.STEADY_SHOT} /> if nothing else is available.
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
              <SpellLink spell={TALENTS_HUNTER.CHIMAERA_SHOT_TALENT} />
            ) : (
              <SpellLink spell={SPELLS.ARCANE_SHOT} />
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

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default MarksmanshipChecklist;
