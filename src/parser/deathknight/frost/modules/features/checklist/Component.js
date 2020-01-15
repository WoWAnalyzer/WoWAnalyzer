import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const FrostDeathKnightChecklist = ({ combatant, castEfficiency, thresholds }) => {
  const AbilityRequirement = props => (
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
        name="Use cooldowns as often as possible"
        description={(
          <>
            You should aim to use your cooldowns as often as you can to maximize your damage output.{' '}
            <a href="https://www.wowhead.com/frost-death-knight-rotation-guide#cooldown-usage" target="_blank" rel="noopener noreferrer">More info.</a>
          </>
        )}
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
        name="Try to avoid being inactive for a large portion of the fight"
        description={(
          <>
            While some downtime is inevitable in fights with movement, you should aim to reduce downtime to prevent capping Runes.  In a worst case scenario, you can cast <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to prevent Rune capping
          </>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <Rule
        name="Avoid capping Runes"
        description="Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  You can have up to three runes recharging at once.  You want to dump runes whenever you have 4 or more runes to make sure none are wasted"
      >
        <Requirement name={'Rune Efficiency'} thresholds={thresholds.runeEfficiency} />
      </Rule>
      <Rule
        name="Avoid capping Runic Power"
        description={(<>Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  Cast <SpellLink id={SPELLS.FROST_STRIKE_CAST.id} /> when you have 76 or more Runic Power to avoid overcapping.</>)}
      >
        <Requirement name={'Runic Power Efficiency'} thresholds={thresholds.runicPowerEfficiency} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

FrostDeathKnightChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default FrostDeathKnightChecklist;
