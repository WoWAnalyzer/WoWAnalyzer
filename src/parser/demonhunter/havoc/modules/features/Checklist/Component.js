import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';

class HavocDemonHunterChecklist extends React.PureComponent {
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
  };

  render() {
    const { combatant, castEfficiency, thresholds } = this.props;

    const AbilityRequirement = props => (
      <GenericCastEfficiencyRequirement
        castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
        {...props}
      />
    );

    return (
      <Checklist>

        <Rule
          name="Use your short cooldowns"
          description={(
            <>
              <p>These should generally always be on recharge to maximize DPS and efficiency.</p>
              <a href="http://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          {combatant.hasTalent(SPELLS.IMMOLATION_AURA_TALENT.id) && <AbilityRequirement spell={SPELLS.IMMOLATION_AURA_TALENT.id} />}
          {combatant.hasTalent(SPELLS.FELBLADE_TALENT.id) && <AbilityRequirement spell={SPELLS.FELBLADE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.FIRST_BLOOD_TALENT.id) && <AbilityRequirement spell={SPELLS.BLADE_DANCE.id} /> && <AbilityRequirement spell={SPELLS.DEATH_SWEEP.id} />}
          {combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) && <AbilityRequirement spell={SPELLS.FEL_RUSH_CAST.id} />}
          {combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) && <AbilityRequirement spell={SPELLS.VENGEFUL_RETREAT.id} />}
        </Rule>

        <Rule
          name="Don't waste casts"
          description={(
            <>
            Ineffectively or improperly casting these spells will lead to dps loss.
            <a href="http://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          {combatant.hasTalent(SPELLS.BLIND_FURY_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} /> bad casts
                </>
              )}
              thresholds={thresholds.blindFuryBadCasts}
            />
          )}
          {combatant.hasTalent(SPELLS.DEMONIC_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.DEMONIC_TALENT.id} /> bad casts
                </>
              )}
              thresholds={thresholds.demonicBadCasts}
            />
          )}
          {combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> bad casts
                </>
              )}
              thresholds={thresholds.felEruptionBadCasts}
            />
          )}
          {combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.FEL_BARRAGE_TALENT.id} /> bad casts
                </>
              )}
              thresholds={thresholds.felBarrageBadCasts}
            />
          )}
        </Rule>

        <Rule
          name="Maintain your buffs and debuffs"
          description={(
            <>
              <p>It is important to maintain these as they contribute a large amount to your DPS and HPS.</p>
              <a href="http://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          {combatant.hasTalent(SPELLS.NEMESIS_TALENT.id) && <AbilityRequirement spell={SPELLS.NEMESIS_TALENT.id} />}
          {combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> buff uptime
                </>
              )}
              thresholds={thresholds.momentumBuffUptime}
            />
          )}
        </Rule>

        <Rule
          name="Use your offensive cooldowns"
          description={(
            <>
              <p>You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value.</p>
              <a href="http://www.wowhead.com/havoc-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          <AbilityRequirement spell={SPELLS.METAMORPHOSIS_HAVOC.id} />
          <AbilityRequirement spell={SPELLS.EYE_BEAM.id} />
          {combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id) && <AbilityRequirement spell={SPELLS.FEL_BARRAGE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.DARK_SLASH_TALENT.id) && <AbilityRequirement spell={SPELLS.DARK_SLASH_TALENT.id} />}
        </Rule>

        <Rule
          name="Manage your fury properly"
          description={(
            <>
            <p>You should always avoid capping your fury and spend it regularly.</p>
            <a href="https://www.wowhead.com/guides/havoc-demon-hunter-get-good-how-to-improve#major-pitfalls" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          <Requirement
            name="Total Fury Efficiency"
            thresholds={thresholds.totalFuryWasted}
          />

            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.DEMONS_BITE.id} /> wasted fury
                </>
              )}
              thresholds={thresholds.demonBiteFury}
            />
          {combatant.hasTalent(SPELLS.IMMOLATION_AURA_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.IMMOLATION_AURA_TALENT.id} /> fury wasted
                </>
              )}
              thresholds={thresholds.immolationAuraEfficiency}
            />
          )}
          {combatant.hasTalent(SPELLS.FELBLADE_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.FELBLADE_TALENT.id} /> fury wasted
                </>
              )}
              thresholds={thresholds.felbladeEfficiency}
            />
          )}
          {combatant.hasTalent(SPELLS.DEMONIC_APPETITE_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.DEMONIC_APPETITE_TALENT.id} /> fury wasted
                </>
              )}
              thresholds={thresholds.demonicAppetite}
            />
          )}
          {combatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id) &&(
            <Requirement
              name={(
                <>
                <SpellLink id={SPELLS.DEMON_BLADES_TALENT.id} /> fury wasted
                </>
              )}
              thresholds={thresholds.demonBladesEfficiency}
            />
          )}
        </Rule>

        <PreparationRule thresholds={thresholds} />

      </Checklist>
    );
  }
}

export default HavocDemonHunterChecklist;
