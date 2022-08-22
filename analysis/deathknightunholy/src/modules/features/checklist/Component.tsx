import { t, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/shadowlands/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

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
        name={t({
          id: 'deathknight.unholy.checklist.useCds',
          message: 'Use cooldowns as often as possible',
        })}
        description={
          <Trans id="deathknight.unholy.checklist.useCds.desc">
            You should aim to use your cooldowns as often as you can to maximize your damage output.
            <a
              href="https://www.wowhead.com/unholy-death-knight-rotation-guide#cooldown-usage"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </Trans>
        }
      >
        <AbilityRequirement spell={SPELLS.APOCALYPSE.id} />
        <AbilityRequirement spell={SPELLS.DARK_TRANSFORMATION.id} />
        {combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SOUL_REAPER_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.SUMMON_GARGOYLE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SUMMON_GARGOYLE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.UNHOLY_ASSAULT_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.UNHOLY_ASSAULT_TALENT.id} />
        )}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_RUNIC_POWER.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_RUNIC_POWER.id} />
        )}
        {combatant.hasTalent(SPELLS.UNHOLY_BLIGHT_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.UNHOLY_BLIGHT_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.DEFILE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.DEFILE_TALENT.id} />
        )}
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.unholy.checklist.stayActive',
          message: 'Try to avoid being inactive for a large portion of the fight',
        })}
        description={t({
          id: 'deathknight.unholy.checklist.stayActive.desc',
          message:
            'While some downtime is inevitable in fights with movement, you should aim to reduce downtime to prevent capping Runes',
        })}
      >
        <Requirement
          name={t({ id: 'deathknight.unholy.checklist.stayActive.downtime', message: 'Downtime' })}
          thresholds={thresholds.downtimeSuggestionThresholds}
        />
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.unholy.checklist.avoidCappingRunes',
          message: 'Avoid capping Runes',
        })}
        description={t({
          id: 'deathknight.unholy.checklist.avoidCappingRunes.desc',
          message:
            'Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  You can have up to three runes recharging at once.  You want to dump runes whenever you have 4 or more runes to make sure none are wasted',
        })}
      >
        <Requirement
          name={t({
            id: 'deathknight.unholy.checklist.avoidCappingRunes.efficiency',
            message: 'Rune Efficiency',
          })}
          thresholds={thresholds.runeEfficiency}
        />
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.unholy.checklist.avoidCappingRp',
          message: 'Avoid capping Runic Power',
        })}
        description={
          <Trans id="deathknight.unholy.checklist.avoidCappingRp.desc">
            Death Knights are a resource based class, relying on Runes and Runic Power to cast core
            abilities. Cast <SpellLink id={SPELLS.DEATH_COIL.id} /> when you have 80 or more Runic
            Power to avoid overcapping.
          </Trans>
        }
      >
        <Requirement
          name={t({
            id: 'deathknight.unholy.checklist.avoidCappingRp.efficiency',
            message: 'Runic Power Efficiency',
          })}
          thresholds={thresholds.runicPowerEfficiency}
        />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default UnholyDeathKnightChecklist;
