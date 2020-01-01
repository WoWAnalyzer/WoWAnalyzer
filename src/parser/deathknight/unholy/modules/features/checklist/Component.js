import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const UnholyDeathKnightChecklist = ({ combatant, castEfficiency, thresholds }) => {
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
            You should aim to use your cooldowns as often as you can to maximize your damage output. In the case of <SpellLink id={SPELLS.SOUL_REAPER_TALENT.id} />, you want to use it when you're at less than 2 runes. However, you also want to make sure you don't waste possible casts by holding on to it for too long.{' '}
            <a href="https://www.wowhead.com/unholy-death-knight-rotation-guide#cooldown-usage" target="_blank" rel="noopener noreferrer">More info.</a>
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.APOCALYPSE.id} />
        <AbilityRequirement spell={SPELLS.DARK_TRANSFORMATION.id} />
        {combatant.hasTalent(SPELLS.SOUL_REAPER_TALENT.id) && <AbilityRequirement spell={SPELLS.SOUL_REAPER_TALENT.id} />}
        {combatant.hasTalent(SPELLS.SUMMON_GARGOYLE_TALENT.id) && <AbilityRequirement spell={SPELLS.SUMMON_GARGOYLE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.UNHOLY_FRENZY_TALENT.id) && <AbilityRequirement spell={SPELLS.UNHOLY_FRENZY_TALENT.id} />}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_RUNIC_POWER.id) && (<AbilityRequirement spell={SPELLS.ARCANE_TORRENT_RUNIC_POWER.id} />)}
        {combatant.hasTalent(SPELLS.UNHOLY_BLIGHT_TALENT.id) && <AbilityRequirement spell={SPELLS.UNHOLY_BLIGHT_TALENT.id} />}
        {combatant.hasTalent(SPELLS.DEFILE_TALENT.id) && <AbilityRequirement spell={SPELLS.DEFILE_TALENT.id} />}

      </Rule>
      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={(
          <>
            While some downtime is inevitable in fights with movement, you should aim to reduce downtime to prevent capping Runes.
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
        description={(<>Death Knights are a resource based class, relying on Runes and Runic Power to cast core abilities.  Cast <SpellLink id={SPELLS.DEATH_COIL.id} /> when you have 72 or more Runic Power to avoid overcapping.</>)}
      >
        <Requirement name={'Runic Power Efficiency'} thresholds={thresholds.runicPowerEfficiency} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

UnholyDeathKnightChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default UnholyDeathKnightChecklist;
