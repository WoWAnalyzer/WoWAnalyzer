import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
// import ITEMS from 'common/ITEMS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
// import { ItemLink } from 'interface';
import { ResourceLink } from 'interface';
import { TooltipElement } from 'interface';
import Combatant from 'parser/core/Combatant';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Checklist from 'parser/shared/modules/features/Checklist';
import { AbilityRequirementProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const DisciplinePriestChecklist = ({
  combatant,
  castEfficiency,
  thresholds,
}: {
  combatant: Combatant;
  castEfficiency: CastEfficiency;
  thresholds: any;
}) => {
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
            performance, remember to <SpellLink id={SPELLS.SMITE.id} /> as often as you can!
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.PENANCE_CAST.id} />
        {combatant.hasTalent(TALENTS.SCHISM_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.SCHISM_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.POWER_WORD_SOLACE_TALENT) && (
          <AbilityRequirement spell={TALENTS.POWER_WORD_SOLACE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.DIVINE_STAR_SHARED_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.DIVINE_STAR_SHARED_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SHADOW_COVENANT_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.SHADOW_COVENANT_TALENT.id} />
        )}
      </Rule>

      <Rule
        name="Use cooldowns effectively"
        description={
          <>
            Cooldowns are an important part of healing, try to use them to counter fight mechanics.
            For example if a boss has burst damage every 1.5 minutes,{' '}
            <SpellLink id={SPELLS.RAPTURE.id} /> should be used to counter it.
          </>
        }
      >
        {!combatant.hasTalent(TALENTS.MINDBENDER_DISCIPLINE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SHADOWFIEND.id} />
        )}
        {combatant.hasTalent(TALENTS.MINDBENDER_DISCIPLINE_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.MINDBENDER_DISCIPLINE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.HALO_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.HALO_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.EVANGELISM_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.EVANGELISM_TALENT.id} />
        )}
        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA1.id} />
        )}
        <AbilityRequirement spell={TALENTS.POWER_INFUSION_TALENT.id} />
      </Rule>

      <Rule
        name="Use your supportive abilities"
        description="While you shouldn't aim to cast defensives and externals on cooldown, be aware of them and try to use them whenever effective. Not using them at all indicates you might not be aware of them enough or not utilizing them optimally."
      >
        <AbilityRequirement spell={SPELLS.PAIN_SUPPRESSION.id} />
        <AbilityRequirement spell={SPELLS.LEAP_OF_FAITH.id} />
        <AbilityRequirement spell={SPELLS.DESPERATE_PRAYER.id} />
      </Rule>

      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={
          <>
            High downtime is inexcusable, while it may be tempting to not cast and save mana,
            Discipline's damage fillers such as <SpellLink id={SPELLS.SMITE.id} /> are extremely
            cheap. You can reduce your downtime by reducing the delay between casting spells,
            anticipating movement, moving during the GCD, and{' '}
            <TooltipElement content="You can ignore this while learning Discipline, but contributing DPS whilst healing is a major part of becoming a better than average player.">
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

export default DisciplinePriestChecklist;
