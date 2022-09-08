import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_COVENANTS from 'common/SPELLS/shadowlands/covenants/demonhunter';
import DH_LEGENDARIES from 'common/SPELLS/shadowlands/legendaries/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import COVENANTS from 'game/shadowlands/COVENANTS';
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

const VengeanceDemonHunterChecklist = (props: ChecklistProps) => {
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
        name="Use your short cooldowns"
        description={
          <>
            These should generally always be on recharge to maximize DPS, HPS and efficiency.
            <br />
            <a
              href="https://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <AbilityRequirement spell={DH_SPELLS.IMMOLATION_AURA.id} />
        {!(
          combatant.hasCovenant(COVENANTS.KYRIAN.id) &&
          combatant.hasLegendary(DH_LEGENDARIES.RAZELIKHS_DEFILEMENT)
        ) && <AbilityRequirement spell={DH_SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id} />}
        <AbilityRequirement spell={DH_SPELLS.FEL_DEVASTATION.id} />
        {combatant.hasTalent(DH_TALENTS.FRACTURE_TALENT.id) && (
          <AbilityRequirement spell={DH_TALENTS.FRACTURE_TALENT.id} />
        )}
        {combatant.hasTalent(DH_TALENTS.FELBLADE_TALENT.id) && (
          <AbilityRequirement spell={DH_TALENTS.FELBLADE_TALENT.id} />
        )}
        {combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
          <AbilityRequirement spell={DH_COVENANTS.ELYSIAN_DECREE.id} />
        )}
        {combatant.hasCovenant(COVENANTS.VENTHYR.id) && (
          <AbilityRequirement spell={DH_COVENANTS.SINFUL_BRAND.id} />
        )}
        {combatant.hasCovenant(COVENANTS.NECROLORD.id) && (
          <AbilityRequirement spell={DH_COVENANTS.FODDER_TO_THE_FLAME.id} />
        )}
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <AbilityRequirement spell={DH_COVENANTS.THE_HUNT.id} />
        )}
      </Rule>

      <Rule
        name="Use your rotational defensive/healing abilities"
        description={
          <>
            Use these to block damage spikes and keep damage smooth to reduce external healing
            required.
            <br />
            <a
              href="https://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={DH_SPELLS.DEMON_SPIKES.id} />
            </>
          }
          thresholds={thresholds.demonSpikes}
        />
        {combatant.hasTalent(DH_TALENTS.SPIRIT_BOMB_TALENT.id) &&
          !combatant.hasTalent(DH_TALENTS.FEED_THE_DEMON_TALENT.id) && (
            <Requirement
              name={
                <>
                  <SpellLink id={DH_TALENTS.SPIRIT_BOMB_TALENT.id} /> casted at 4+ souls
                </>
              }
              thresholds={thresholds.spiritBombSoulsConsume}
            />
          )}
        {!combatant.hasTalent(DH_TALENTS.FEED_THE_DEMON_TALENT.id) &&
          combatant.hasTalent(DH_TALENTS.SPIRIT_BOMB_TALENT.id) && (
            <Requirement
              name={
                <>
                  <SpellLink id={DH_SPELLS.SOUL_CLEAVE.id} /> minimizing souls consumed
                </>
              }
              thresholds={thresholds.soulCleaveSoulsConsumed}
            />
          )}
        {combatant.hasTalent(DH_TALENTS.SOUL_BARRIER_TALENT.id) && (
          <AbilityRequirement spell={DH_TALENTS.SOUL_BARRIER_TALENT.id} />
        )}
      </Rule>

      <Rule
        name="Use your long defensive/healing cooldowns"
        description={
          <>
            Use these to mitigate large damage spikes or in emergency situations.
            <br />
            <a
              href="https://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <AbilityRequirement spell={DH_SPELLS.METAMORPHOSIS_TANK.id} />
        <AbilityRequirement spell={DH_SPELLS.FIERY_BRAND.id} />
      </Rule>

      {(combatant.hasTalent(DH_TALENTS.SPIRIT_BOMB_TALENT.id) ||
        combatant.hasTalent(DH_TALENTS.VOID_REAVER_TALENT.id)) && (
        <Rule
          name="Maintain your buffs and debuffs"
          description={
            <>
              It is important to maintain these as they contribute a large amount to your DPS and
              HPS.
              <br />
              <a
                href="https://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list"
                target="_blank"
                rel="noopener noreferrer"
              >
                More info.
              </a>
            </>
          }
        >
          {combatant.hasTalent(DH_TALENTS.SPIRIT_BOMB_TALENT.id) && (
            <Requirement
              name={
                <>
                  <SpellLink id={DH_SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> debuff uptime
                </>
              }
              thresholds={thresholds.spiritBombFrailtyDebuff}
            />
          )}
          {combatant.hasTalent(DH_TALENTS.VOID_REAVER_TALENT.id) && (
            <Requirement
              name={
                <>
                  <SpellLink id={DH_TALENTS.VOID_REAVER_TALENT.id} /> debuff uptime
                </>
              }
              thresholds={thresholds.voidReaverDebuff}
            />
          )}
        </Rule>
      )}

      <Rule
        name="Manage your resources properly"
        description={<>You should always avoid capping your Fury/Souls and spend them regularly.</>}
      >
        <Requirement name="Total Fury Waste" thresholds={thresholds.furyDetails} />
        {combatant.hasTalent(DH_SPELLS.IMMOLATION_AURA.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={DH_SPELLS.IMMOLATION_AURA.id} /> Fury wasted
              </>
            }
            thresholds={thresholds.immolationAuraEfficiency}
          />
        )}

        {!combatant.hasTalent(DH_TALENTS.FRACTURE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={DH_SPELLS.SHEAR.id} /> bad casts
              </>
            }
            thresholds={thresholds.shearFracture}
          />
        )}

        {combatant.hasTalent(DH_TALENTS.FRACTURE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={DH_TALENTS.FRACTURE_TALENT.id} /> bad casts
              </>
            }
            thresholds={thresholds.shearFracture}
          />
        )}
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default VengeanceDemonHunterChecklist;
