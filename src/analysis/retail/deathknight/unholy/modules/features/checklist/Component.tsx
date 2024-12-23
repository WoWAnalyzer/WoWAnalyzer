import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';

const UnholyDeathKnightChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use major abilities as often as possible"
        description={
          <>
            You should aim to use major abilities as often as you can to maximize your damage
            output.
            <a
              href="https://www.wowhead.com/unholy-death-knight-rotation-guide#cooldown-usage"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        {combatant.hasTalent(TALENTS.ABOMINATION_LIMB_TALENT) && (
          <AbilityRequirement spell={TALENTS.ABOMINATION_LIMB_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.UNHOLY_ASSAULT_TALENT) && (
          <AbilityRequirement spell={TALENTS.UNHOLY_ASSAULT_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.VILE_CONTAGION_TALENT) && (
          <AbilityRequirement spell={TALENTS.VILE_CONTAGION_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.ARMY_OF_THE_DEAD_TALENT) &&
          !combatant.hasTalent(TALENTS.RAISE_ABOMINATION_TALENT) && (
            <AbilityRequirement spell={TALENTS.ARMY_OF_THE_DEAD_TALENT.id} />
          )}
        {combatant.hasTalent(TALENTS.RAISE_ABOMINATION_TALENT) && (
          <AbilityRequirement spell={TALENTS.RAISE_ABOMINATION_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.APOCALYPSE_TALENT) && (
          <AbilityRequirement spell={TALENTS.APOCALYPSE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT) && (
          <AbilityRequirement spell={TALENTS.DARK_TRANSFORMATION_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SACRIFICIAL_PACT_TALENT) && (
          <AbilityRequirement spell={TALENTS.SACRIFICIAL_PACT_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SUMMON_GARGOYLE_TALENT) && (
          <AbilityRequirement spell={TALENTS.SUMMON_GARGOYLE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.SOUL_REAPER_TALENT) && (
          <AbilityRequirement spell={TALENTS.SOUL_REAPER_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.DEFILE_TALENT) && (
          <AbilityRequirement spell={TALENTS.DEFILE_TALENT.id} />
        )}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_RUNIC_POWER.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_RUNIC_POWER.id} />
        )}
        {combatant.hasTalent(TALENTS.UNHOLY_BLIGHT_TALENT) &&
          !combatant.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT) && (
            <AbilityRequirement spell={TALENTS.UNHOLY_BLIGHT_TALENT.id} />
          )}
      </Rule>
      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={
          <>
            While some downtime is inevitable in fights with movement, you should aim to reduce
            downtime to prevent capping Runes.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <Rule
        name="Avoid capping Runes"
        description="Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  You can have up to three runes recharging at once.  You want to dump runes whenever you have 4 or more runes to make sure none are wasted"
      >
        <Requirement name="Rune Efficiency" thresholds={thresholds.runeEfficiency} />
      </Rule>
      <Rule
        name="Avoid capping Runic Power"
        description={
          <>
            Death Knights are a resource based class, relying on Runes and Runic Power to cast core
            abilities. Cast <SpellLink spell={SPELLS.DEATH_COIL} /> when you have 80 or more Runic
            Power to avoid overcapping.
          </>
        }
      >
        <Requirement name="Runic Power Efficiency" thresholds={thresholds.runicPowerEfficiency} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default UnholyDeathKnightChecklist;
