import SPELLS from 'common/SPELLS/demonhunter';
import {
  BLIND_FURY_HAVOC_TALENT,
  DEMON_BLADES_HAVOC_TALENT,
  DEMONIC_APPETITE_HAVOC_TALENT,
  DEMONIC_TALENT,
  ELYSIAN_DECREE_VENGEANCE_TALENT,
  ESSENCE_BREAK_HAVOC_TALENT,
  FEL_BARRAGE_HAVOC_TALENT,
  FEL_ERUPTION_HAVOC_TALENT,
  FELBLADE_TALENT,
  FIRST_BLOOD_HAVOC_TALENT,
  MOMENTUM_HAVOC_TALENT,
  THE_HUNT_TALENT,
} from 'common/TALENTS/demonhunter';
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
        {combatant.hasTalent(SPELLS.IMMOLATION_AURA.id) && (
          <AbilityRequirement spell={SPELLS.IMMOLATION_AURA.id} />
        )}
        {combatant.hasTalent(FIRST_BLOOD_HAVOC_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.BLADE_DANCE.id} />
        )}
        {combatant.hasTalent(MOMENTUM_HAVOC_TALENT.id) && (
          <>
            <AbilityRequirement spell={SPELLS.FEL_RUSH_CAST.id} />
            <AbilityRequirement spell={SPELLS.VENGEFUL_RETREAT.id} />
          </>
        )}
        {combatant.hasTalent(FELBLADE_TALENT.id) && (
          <AbilityRequirement spell={FELBLADE_TALENT.id} />
        )}
        {combatant.hasTalent(ELYSIAN_DECREE_VENGEANCE_TALENT) && (
          <AbilityRequirement spell={SPELLS.ELYSIAN_DECREE.id} />
        )}
        {combatant.hasTalent(THE_HUNT_TALENT) && <AbilityRequirement spell={SPELLS.THE_HUNT.id} />}
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
        {combatant.hasTalent(BLIND_FURY_HAVOC_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={BLIND_FURY_HAVOC_TALENT.id} /> bad casts
              </>
            }
            thresholds={thresholds.blindFuryBadCasts}
          />
        )}
        {combatant.hasTalent(DEMONIC_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={DEMONIC_TALENT.id} /> bad casts
              </>
            }
            thresholds={thresholds.demonicBadCasts}
          />
        )}
        {combatant.hasTalent(FEL_ERUPTION_HAVOC_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={FEL_ERUPTION_HAVOC_TALENT.id} /> bad casts
              </>
            }
            thresholds={thresholds.felEruptionBadCasts}
          />
        )}
        {combatant.hasTalent(FEL_BARRAGE_HAVOC_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={FEL_BARRAGE_HAVOC_TALENT.id} /> bad casts
              </>
            }
            thresholds={thresholds.felBarrageBadCasts}
          />
        )}
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
        {combatant.hasTalent(MOMENTUM_HAVOC_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={MOMENTUM_HAVOC_TALENT.id} /> buff uptime
              </>
            }
            thresholds={thresholds.momentumBuffUptime}
          />
        )}
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
        <AbilityRequirement spell={SPELLS.EYE_BEAM.id} />
        {combatant.hasTalent(FEL_BARRAGE_HAVOC_TALENT.id) && (
          <AbilityRequirement spell={FEL_BARRAGE_HAVOC_TALENT.id} />
        )}
        {combatant.hasTalent(ESSENCE_BREAK_HAVOC_TALENT.id) && (
          <AbilityRequirement spell={ESSENCE_BREAK_HAVOC_TALENT.id} />
        )}
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

        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.DEMONS_BITE.id} /> wasted Fury
            </>
          }
          thresholds={thresholds.demonBiteFury}
        />
        {combatant.hasTalent(SPELLS.IMMOLATION_AURA.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.IMMOLATION_AURA.id} /> Fury wasted
              </>
            }
            thresholds={thresholds.immolationAuraEfficiency}
          />
        )}
        {combatant.hasTalent(FELBLADE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={FELBLADE_TALENT.id} /> Fury wasted
              </>
            }
            thresholds={thresholds.felbladeEfficiency}
          />
        )}
        {combatant.hasTalent(DEMONIC_APPETITE_HAVOC_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={DEMONIC_APPETITE_HAVOC_TALENT.id} /> Fury wasted
              </>
            }
            thresholds={thresholds.demonicAppetiteEfficiency}
          />
        )}
        {combatant.hasTalent(DEMON_BLADES_HAVOC_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={DEMON_BLADES_HAVOC_TALENT.id} /> Fury wasted
              </>
            }
            thresholds={thresholds.demonBladesEfficiency}
          />
        )}
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default HavocDemonHunterChecklist;
