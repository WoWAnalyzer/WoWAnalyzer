import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import Requirement from 'parser/shared/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class FuryWarriorChecklist extends React.PureComponent {
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
          name="Use cooldowns effectively"
          description="Your cooldowns are an important contributor to your damage throughput. Try to get in as many efficient casts as the fight allows."
        >
          {combatant.hasTalent(SPELLS.SIEGEBREAKER_TALENT.id) && (<AbilityRequirement spell={SPELLS.SIEGEBREAKER_TALENT.id} />)}
          {combatant.hasTalent(SPELLS.BLADESTORM_TALENT.id) && (<AbilityRequirement spell={SPELLS.BLADESTORM_TALENT.id} />)}
          {combatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id) && (<AbilityRequirement spell={SPELLS.DRAGON_ROAR_TALENT.id} />)}
          <AbilityRequirement spell={SPELLS.RECKLESSNESS.id} />
          {/* We can't detect race, so disable this when it has never been cast. */}
          {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_RAGE.id) && (<AbilityRequirement spell={SPELLS.ARCANE_TORRENT_RAGE.id} />)}
        </Rule>
        <Rule
          name="Use Rampage"
          description={(
            <>
              Using <SpellLink id={SPELLS.RAMPAGE.id} /> is an important part of the Fury rotation. If you aren't Enraged, <SpellLink id={SPELLS.RAMPAGE.id} /> should be used as soon as you have enough rage. Also, use <SpellLink id={SPELLS.RAMPAGE.id} /> if you would reach maximum rage otherwise.
            </>
          )}
        >
          <Requirement
            name={(
              <>
                Number of missed <SpellLink id={SPELLS.RAMPAGE.id} /> casts
              </>
            )}
            thresholds={thresholds.missedRampage}
          />
        </Rule>
        <Rule
          name="Use your defensive cooldowns"
          description="While you shouldn't cast these defensives on cooldown, be aware of them and use them whenever effective. Not using them at all indicates you might not be aware of them or not using them optimally."
        >
          <AbilityRequirement spell={SPELLS.ENRAGED_REGENERATION.id} />
          <AbilityRequirement spell={SPELLS.RALLYING_CRY.id} />
        </Rule>
        <Rule
          name="Avoid downtime"
          description={(
            <>
              As a melee DPS, it is important to stay within range of the target and cast your abiltiies promptly. If you find yourself out of range, try using <SpellLink id={SPELLS.CHARGE.id} /> and <SpellLink id={SPELLS.HEROIC_LEAP.id} /> to get back more quickly.
            </>
          )}
        >
          <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
        </Rule>
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default FuryWarriorChecklist;
