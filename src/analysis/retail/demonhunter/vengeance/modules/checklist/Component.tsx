import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
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
import TalentRequirement from 'parser/shared/modules/features/Checklist/TalentRequirement';

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
        <AbilityRequirement spell={SPELLS.IMMOLATION_AURA.id} />
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SIGIL_OF_FLAME_PRECISE.id} />
        )}
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id} />
        )}
        {!(
          combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT.id) ||
          combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT.id)
        ) && <AbilityRequirement spell={TALENTS_DEMON_HUNTER.SIGIL_OF_FLAME_TALENT.id} />}
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.FRACTURE_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.FELBLADE_TALENT} />
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT.id) &&
          combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT) && (
            <AbilityRequirement spell={SPELLS.ELYSIAN_DECREE_PRECISE.id} />
          )}
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT.id) &&
          combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT) && (
            <AbilityRequirement spell={SPELLS.ELYSIAN_DECREE_CONCENTRATED.id} />
          )}
        {!(
          combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT.id) ||
          combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT.id)
        ) && (
          <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT} />
        )}
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.RETALIATION_TALENT}
          name={<SpellLink id={SPELLS.DEMON_SPIKES.id} />}
          thresholds={thresholds.demonSpikes}
        />
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT.id) && (
          <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} />
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
          name={<SpellLink id={SPELLS.DEMON_SPIKES.id} />}
          thresholds={thresholds.demonSpikes}
        />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT} />
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
        <AbilityRequirement spell={SPELLS.METAMORPHOSIS_TANK.id} />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} />
      </Rule>

      <Rule
        name="Maintain your buffs and debuffs"
        description={
          <>
            It is important to maintain these as they contribute a large amount to your DPS and HPS.
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
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.FRAILTY_TALENT}
          name={
            <>
              <SpellLink id={SPELLS.FRAILTY.id} /> debuff uptime
            </>
          }
          thresholds={thresholds.frailtyDebuff}
        />
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.PAINBRINGER_TALENT}
          name={
            <>
              <SpellLink id={TALENTS_DEMON_HUNTER.PAINBRINGER_TALENT.id} /> buff uptime
            </>
          }
          thresholds={thresholds.painbringerBuff}
        />
      </Rule>

      <Rule
        name="Manage your resources properly"
        description={<>You should always avoid capping your Fury/Souls and spend them regularly.</>}
      >
        <Requirement name="Total Fury Waste" thresholds={thresholds.furyDetails} />
        {!combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.SHEAR.id} /> bad casts
              </>
            }
            thresholds={thresholds.shearFracture}
          />
        )}
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.FRACTURE_TALENT}
          name={
            <>
              <SpellLink id={TALENTS_DEMON_HUNTER.FRACTURE_TALENT.id} /> bad casts
            </>
          }
          thresholds={thresholds.shearFracture}
        />
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default VengeanceDemonHunterChecklist;
