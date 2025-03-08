import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ResourceLink } from 'interface';
import { TooltipElement } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const HolyPriestChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
            Using your core abilities as often as possible will typically result in better
            performance, remember to <SpellLink spell={SPELLS.SMITE} /> as often as you can!
          </>
        }
      >
        <AbilityRequirement spell={TALENTS.HOLY_WORD_SERENITY_TALENT.id} />
        <AbilityRequirement spell={TALENTS.HOLY_WORD_SANCTIFY_TALENT.id} />
        <AbilityRequirement spell={TALENTS.PRAYER_OF_MENDING_TALENT.id} />

        {combatant.hasTalent(TALENTS.DIVINE_STAR_SHARED_TALENT) && (
          <AbilityRequirement spell={TALENTS.DIVINE_STAR_SHARED_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.HALO_SHARED_TALENT) && (
          <AbilityRequirement spell={SPELLS.HALO_TALENT.id} />
        )}
      </Rule>

      <Rule
        name="Use cooldowns effectively"
        description={
          <>
            Cooldowns are an important part of healing, try to use them to counter fight mechanics.
            For example if a boss has burst damage every 3 minutes,{' '}
            <SpellLink spell={TALENTS.DIVINE_HYMN_TALENT} /> should be used to counter it.
          </>
        }
      >
        <AbilityRequirement spell={TALENTS.GUARDIAN_SPIRIT_TALENT.id} />
        <AbilityRequirement spell={TALENTS.DIVINE_HYMN_TALENT.id} />
        <AbilityRequirement spell={SPELLS.DESPERATE_PRAYER.id} />
        <AbilityRequirement spell={TALENTS.SYMBOL_OF_HOPE_TALENT.id} />
        <AbilityRequirement spell={TALENTS.POWER_INFUSION_TALENT.id} />

        {combatant.hasTalent(TALENTS.APOTHEOSIS_TALENT) && (
          <AbilityRequirement spell={TALENTS.APOTHEOSIS_TALENT.id} />
        )}

        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA1.id} />
        )}
      </Rule>

      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={
          <>
            High downtime is inexcusable, while it may be tempting to not cast and save mana, Holy's
            damage filler <SpellLink spell={SPELLS.SMITE} /> is free. You can reduce your downtime
            by reducing the delay between casting spells, anticipating movement, moving during the
            GCD, and{' '}
            <TooltipElement content="You can ignore this while learning Holy, but contributing DPS whilst healing is a major part of becoming a better than average player.">
              when you're not healing try to contribute some damage.*
            </TooltipElement>
            .
          </>
        }
      >
        <Requirement
          name="Non healing time"
          thresholds={thresholds.nonHealingTimeSuggestionThresholds}
        />
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>

      <Rule
        name={
          <>
            Use all of your <ResourceLink id={RESOURCE_TYPES.MANA.id} /> effectively
          </>
        }
        description="If you have a large amount of mana left at the end of the fight that's mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss's health."
      >
        <Requirement name="Mana left" thresholds={thresholds.manaLeft} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default HolyPriestChecklist;
