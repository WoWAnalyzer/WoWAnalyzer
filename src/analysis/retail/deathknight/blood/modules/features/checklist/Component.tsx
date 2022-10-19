import { t, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
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

const BloodDeathKnightChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
          id: 'deathknight.blood.checklist.useShortCd',
          message: 'Use your short cooldowns',
        })}
        description={t({
          id: 'deathknight.blood.checklist.useShortCd.desc',
          message: 'These should generally always be recharging to maximize efficiency.',
        })}
      >
        <AbilityRequirement spell={SPELLS.BLOOD_BOIL.id} />
        {combatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id) &&
          !combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
            <AbilityRequirement spell={SPELLS.DEATH_AND_DECAY.id} />
          )}
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <AbilityRequirement spell={SPELLS.DEATHS_DUE.id} />
        )}
        {combatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.BLOODDRINKER_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id) && (
          <Requirement
            name={
              <Trans id="deathknight.blood.checklist.useShortCd.crimsonScourge">
                <SpellLink id={SPELLS.CRIMSON_SCOURGE.id} /> procs spent
              </Trans>
            }
            thresholds={thresholds.crimsonScourge}
          />
        )}
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.blood.checklist.dontCapResources',
          message: 'Do not overcap your resources',
        })}
        description={t({
          id: 'deathknight.blood.checklist.dontCapResources.desc',
          message:
            'Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities. Try to spend Runic Power before reaching the maximum amount and always keep atleast 3 Runes on cooldown to avoid wasting resources.',
        })}
      >
        <Requirement
          name={t({
            id: 'deathknight.blood.checklist.dontCapResources.rpEfficiency',
            message: 'Runic Power Efficiency',
          })}
          thresholds={thresholds.runicPower}
        />
        <Requirement
          name={t({
            id: 'deathknight.blood.checklist.dontCapResources.runeEfficiency',
            message: 'Rune Efficiency',
          })}
          thresholds={thresholds.runes}
        />
        <Requirement
          name={
            <Trans id="deathknight.blood.checklist.dontCapResources.marrowrendEfficiency">
              <SpellLink id={SPELLS.MARROWREND.id} /> Efficiency
            </Trans>
          }
          thresholds={thresholds.marrowrend}
        />
        <Requirement
          name={
            <Trans id="deathknight.blood.checklist.dontCapResources.deathsCaressEfficiency">
              <SpellLink id={SPELLS.DEATHS_CARESS.id} /> Efficiency
            </Trans>
          }
          thresholds={thresholds.deathsCaress}
        />
      </Rule>

      <Rule
        name={t({
          id: 'deathknight.blood.checklist.offensiveCd',
          message: 'Use your offensive cooldowns',
        })}
        description={t({
          id: 'deathknight.blood.checklist.offensiveCd.desc',
          message:
            'You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value.',
        })}
      >
        <AbilityRequirement spell={SPELLS.DANCING_RUNE_WEAPON.id} />
        {combatant.hasTalent(SPELLS.CONSUMPTION_TALENT.id) && (
          <Requirement
            name={
              <Trans id="deathknight.blood.checklist.offensiveCd.consumption">
                Possible <SpellLink id={SPELLS.CONSUMPTION_TALENT.id} /> Hits
              </Trans>
            }
            thresholds={thresholds.consumption}
          />
        )}
        {combatant.hasTalent(SPELLS.BONESTORM_TALENT.id) && (
          <Requirement
            name={
              <Trans id="deathknight.blood.checklist.offensiveCd.bonestorm">
                <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> Efficiency
              </Trans>
            }
            thresholds={thresholds.bonestorm}
          />
        )}
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.blood.checklist.buffsDebuffs',
          message: 'Maintain your buffs and debuffs',
        })}
        description={t({
          id: 'deathknight.blood.checklist.buffsDebuffs.desc',
          message:
            'It is important to maintain these as they contribute a large amount to your DPS and HPS.',
        })}
      >
        <Requirement
          name={
            <Trans id="deathknight.blood.checklist.buffsDebuffs.bloodPlague">
              <SpellLink id={SPELLS.BLOOD_PLAGUE.id} /> Uptime
            </Trans>
          }
          thresholds={thresholds.bloodPlague}
        />
        {combatant.hasTalent(SPELLS.MARK_OF_BLOOD_TALENT.id) && (
          <Requirement
            name={
              <Trans id="deathknight.blood.checklist.buffsDebuffs.markOfBlood">
                <SpellLink id={SPELLS.MARK_OF_BLOOD_TALENT.id} /> Uptime
              </Trans>
            }
            thresholds={thresholds.markOfBlood}
          />
        )}
        <Requirement
          name={
            <Trans id="deathknight.blood.checklist.buffsDebuffs.boneShield">
              <SpellLink id={SPELLS.BONE_SHIELD.id} /> Uptime
            </Trans>
          }
          thresholds={thresholds.boneShield}
        />
        <Requirement
          name={
            <Trans id="deathknight.blood.checklist.buffsDebuffs.ossuary">
              <SpellLink id={SPELLS.OSSUARY.id} /> Efficiency
            </Trans>
          }
          thresholds={thresholds.ossuary}
        />
      </Rule>
      <Rule
        name={t({
          id: 'deathknight.blood.checklist.defensives',
          message: 'Use your defensive cooldowns',
        })}
        description={t({
          id: 'deathknight.blood.checklist.defensives.desc',
          message:
            'Use these to block damage spikes and keep damage smooth to reduce external healing required.',
        })}
      >
        <AbilityRequirement spell={SPELLS.VAMPIRIC_BLOOD.id} />
        <AbilityRequirement spell={talents.ICEBOUND_FORTITUDE_TALENT.id} />
        <AbilityRequirement spell={talents.ANTI_MAGIC_SHELL_TALENT.id} />
        {combatant.hasTalent(SPELLS.RUNE_TAP.id) && (
          <AbilityRequirement spell={SPELLS.RUNE_TAP.id} />
        )}
        {combatant.hasTalent(SPELLS.TOMBSTONE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.TOMBSTONE_TALENT.id} />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default BloodDeathKnightChecklist;
