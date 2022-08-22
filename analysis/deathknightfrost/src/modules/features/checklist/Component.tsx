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

const FrostDeathKnightChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
          id: 'deathknight.frost.checklist.useCds',
          message: 'Use cooldowns as often as possible',
        })}
        description={
          <Trans id="deathknight.frost.checklist.useCds.desc">
            You should aim to use your cooldowns as often as you can to maximize your damage output.{' '}
            <a
              href="https://www.wowhead.com/frost-death-knight-rotation-guide#cooldown-usage"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </Trans>
        }
      >
        <AbilityRequirement spell={SPELLS.PILLAR_OF_FROST.id} />
        {combatant.hasTalent(SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.EMPOWER_RUNE_WEAPON.id} />
        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_RUNIC_POWER.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_RUNIC_POWER.id} />
        )}
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.frost.checklist.stayActive',
          message: 'Try to avoid being inactive for a large portion of the fight',
        })}
        description={
          <Trans id="deathknight.frost.checklist.stayActive.desc">
            While some downtime is inevitable in fights with movement, you should aim to reduce
            downtime to prevent capping Runes. In a worst case scenario, you can cast{' '}
            <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to prevent Rune capping
          </Trans>
        }
      >
        <Requirement
          name={t({ id: 'deathknight.frost.checklist.stayActive.downtime', message: 'Downtime' })}
          thresholds={thresholds.downtimeSuggestionThresholds}
        />
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.frost.checklist.avoidCappingRunes',
          message: 'Avoid capping Runes',
        })}
        description={t({
          id: 'deathknight.frost.checklist.avoidCappingRunes.desc',
          message:
            'Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  You can have up to three runes recharging at once.  You want to dump runes whenever you have 4 or more runes to make sure none are wasted',
        })}
      >
        <Requirement
          name={t({
            id: 'deathknight.frost.checklist.avoidCappingRunes.efficiency',
            message: 'Rune Efficiency',
          })}
          thresholds={thresholds.runeEfficiency}
        />
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.frost.checklist.avoidCappingRp',
          message: 'Avoid capping Runic Power',
        })}
        description={
          <Trans id="deathknight.frost.checklist.avoidCappingRp.desc">
            Death Knights are a resource based class, relying on Runes and Runic Power to cast core
            abilities. Cast <SpellLink id={SPELLS.FROST_STRIKE_CAST.id} /> when you have 73+ Runic
            Power to avoid overcapping.
          </Trans>
        }
      >
        <Requirement
          name={t({
            id: 'deathknight.frost.checklist.avoidCappingRp.efficiency',
            message: 'Runic Power Efficiency',
          })}
          thresholds={thresholds.runicPowerEfficiency}
        />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};
export default FrostDeathKnightChecklist;
