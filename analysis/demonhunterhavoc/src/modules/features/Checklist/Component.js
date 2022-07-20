import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/shadowlands/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PropTypes from 'prop-types';

const HavocDemonHunterChecklist = ({ combatant, castEfficiency, thresholds }) => {
  const AbilityRequirement = (props) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

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
        {combatant.hasTalent(SPELLS.FELBLADE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.FELBLADE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.FIRST_BLOOD_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.BLADE_DANCE.id} />
        )}
        {combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.FEL_RUSH_CAST.id} />
        )}
        {combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.VENGEFUL_RETREAT.id} />
        )}
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
        {combatant.hasTalent(SPELLS.BLIND_FURY_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} /> bad casts
              </>
            }
            thresholds={thresholds.blindFuryBadCasts}
          />
        )}
        {combatant.hasTalent(SPELLS.DEMONIC_TALENT_HAVOC.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.DEMONIC_TALENT_HAVOC.id} /> bad casts
              </>
            }
            thresholds={thresholds.demonicBadCasts}
          />
        )}
        {combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> bad casts
              </>
            }
            thresholds={thresholds.felEruptionBadCasts}
          />
        )}
        {combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.FEL_BARRAGE_TALENT.id} /> bad casts
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
        {combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> buff uptime
              </>
            }
            thresholds={thresholds.momentumBuffUptime}
          />
        )}
        {combatant.hasCovenant(COVENANTS.VENTHYR.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.SINFUL_BRAND.id} /> debuff uptime
              </>
            }
            thresholds={thresholds.sinfulBrandUptime}
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
        {combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.FEL_BARRAGE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.ESSENCE_BREAK_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.ESSENCE_BREAK_TALENT.id} />
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
        {combatant.hasTalent(SPELLS.FELBLADE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.FELBLADE_TALENT.id} /> Fury wasted
              </>
            }
            thresholds={thresholds.felbladeEfficiency}
          />
        )}
        {combatant.hasTalent(SPELLS.DEMONIC_APPETITE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.DEMONIC_APPETITE_TALENT.id} /> Fury wasted
              </>
            }
            thresholds={thresholds.demonicAppetiteEfficiency}
          />
        )}
        {combatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.DEMON_BLADES_TALENT.id} /> Fury wasted
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

HavocDemonHunterChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasCovenant: PropTypes.func.isRequired,
    hasTalent: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default HavocDemonHunterChecklist;
