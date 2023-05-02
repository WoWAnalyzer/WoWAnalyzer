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

const HavocDemonHunterChecklist = (props: ChecklistProps) => {
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
            These should generally always be on recharge to maximize DPS and efficiency.
            <a
              href="https://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.IMMOLATION_AURA.id} />
        <TalentCastEfficiencyRequirement
          talent={TALENTS_DEMON_HUNTER.FIRST_BLOOD_TALENT}
          actualCast={SPELLS.BLADE_DANCE}
        />
        <TalentCastEfficiencyRequirement
          talent={TALENTS_DEMON_HUNTER.MOMENTUM_TALENT}
          actualCast={SPELLS.FEL_RUSH_CAST}
        />
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.MOMENTUM_TALENT) && (
          <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT} />
        )}
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.FELBLADE_TALENT} />
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT) && (
          <TalentCastEfficiencyRequirement
            talent={TALENTS_DEMON_HUNTER.SIGIL_OF_FLAME_TALENT}
            actualCast={SPELLS.SIGIL_OF_FLAME_PRECISE}
          />
        )}
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT) && (
          <TalentCastEfficiencyRequirement
            talent={TALENTS_DEMON_HUNTER.SIGIL_OF_FLAME_TALENT}
            actualCast={SPELLS.SIGIL_OF_FLAME_CONCENTRATED}
          />
        )}
        {!(
          combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT) ||
          combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT)
        ) && (
          <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.SIGIL_OF_FLAME_TALENT} />
        )}
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT) && (
          <TalentCastEfficiencyRequirement
            talent={TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT}
            actualCast={SPELLS.ELYSIAN_DECREE_PRECISE}
          />
        )}
        {combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT) && (
          <TalentCastEfficiencyRequirement
            talent={TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT}
            actualCast={SPELLS.ELYSIAN_DECREE_CONCENTRATED}
          />
        )}
        {!(
          combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT) ||
          combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT)
        ) && (
          <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT} />
        )}
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} />
        <TalentCastEfficiencyRequirement
          talent={TALENTS_DEMON_HUNTER.SOULREND_TALENT}
          actualCast={SPELLS.THROW_GLAIVE_HAVOC}
        />
      </Rule>

      <Rule
        name="Don't waste casts"
        description={
          <>
            Ineffectively or improperly casting these spells will lead to DPS loss.
            <a
              href="https://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.BLIND_FURY_TALENT}
          name={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.BLIND_FURY_TALENT.id} /> bad casts
            </>
          }
          thresholds={thresholds.blindFuryBadCasts}
        />
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.DEMONIC_TALENT}
          name={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.DEMONIC_TALENT.id} /> bad casts
            </>
          }
          thresholds={thresholds.demonicBadCasts}
        />
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT}
          name={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.FEL_ERUPTION_TALENT.id} /> bad casts
            </>
          }
          thresholds={thresholds.felEruptionBadCasts}
        />
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT}
          name={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT.id} /> bad casts
            </>
          }
          thresholds={thresholds.felBarrageBadCasts}
        />
      </Rule>

      <Rule
        name="Maintain your buffs and debuffs"
        description={
          <>
            It is important to maintain these as they contribute a large amount to your DPS and HPS.
            <a
              href="https://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.MOMENTUM_TALENT}
          name={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.MOMENTUM_TALENT.id} /> buff uptime
            </>
          }
          thresholds={thresholds.momentumBuffUptime}
        />
      </Rule>

      <Rule
        name="Use your offensive cooldowns"
        description={
          <>
            You should aim to use these cooldowns as often as you can to maximize your damage output
            unless you are saving them for their defensive value.
            <a
              href="https://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.METAMORPHOSIS_HAVOC.id} />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} />
        <TalentCastEfficiencyRequirement talent={TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT} />
      </Rule>

      <Rule
        name="Manage your Fury properly"
        description={
          <>
            You should always avoid capping your Fury and spend it regularly.
            <a
              href="https://www.wowhead.com/guides/havoc-demon-hunter-get-good-how-to-improve#major-pitfalls"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        <Requirement name="Total Fury Efficiency" thresholds={thresholds.totalFuryWasted} />

        {!combatant.hasTalent(TALENTS_DEMON_HUNTER.DEMON_BLADES_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={SPELLS.DEMONS_BITE.id} /> wasted Fury
              </>
            }
            thresholds={thresholds.demonBiteFury}
          />
        )}
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.BURNING_HATRED_TALENT}
          name={
            <>
              <SpellLink spell={SPELLS.IMMOLATION_AURA.id} /> Fury wasted
            </>
          }
          thresholds={thresholds.immolationAuraEfficiency}
        />
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.FELBLADE_TALENT}
          name={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.FELBLADE_TALENT.id} /> Fury wasted
            </>
          }
          thresholds={thresholds.felbladeEfficiency}
        />
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.DEMONIC_APPETITE_TALENT}
          name={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.DEMONIC_APPETITE_TALENT.id} /> Fury wasted
            </>
          }
          thresholds={thresholds.demonicAppetiteEfficiency}
        />
        <TalentRequirement
          talent={TALENTS_DEMON_HUNTER.DEMON_BLADES_TALENT}
          name={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.DEMON_BLADES_TALENT.id} /> Fury wasted
            </>
          }
          thresholds={thresholds.demonBladesEfficiency}
        />
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default HavocDemonHunterChecklist;
