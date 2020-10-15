import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

/**
 * Chaotic Transformation
 * Demon's Bite deals 725 additional damage. When you activate Metamorphosis,
 * the cooldown of Eye Beam and Blade Dance is immediately reset.
 *
 * Example Report: https://www.warcraftlogs.com/reports/Bg7zm1XGKHPyba4W/#fight=1&source=27
 */

class ChaoticTransformation extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  noResetEyeBeam = 0;
  noResetBladeDance = 0;
  resetEyeBeam = 0;
  resetBladeDance = 0;
  eyeBeamCDRemaining = 0;
  bladeDanceCDRemaining = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CHAOTIC_TRANSFORMATION.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.METAMORPHOSIS_HAVOC), this.onMetaCast);
  }

  onMetaCast(event) {
    if (!this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id)){
      this.noResetEyeBeam += 1;
    } else {
      this.resetEyeBeam += 1;
      this.eyeBeamCDRemaining += this.spellUsable.cooldownRemaining(SPELLS.EYE_BEAM.id);
      this.spellUsable.endCooldown(SPELLS.EYE_BEAM.id);
    }

    if (!this.spellUsable.isOnCooldown(SPELLS.BLADE_DANCE.id)){
      this.noResetBladeDance += 1;
    } else {
      this.resetBladeDance += 1;
      this.bladeDanceCDRemaining += this.spellUsable.cooldownRemaining(SPELLS.BLADE_DANCE.id);
      this.spellUsable.endCooldown(SPELLS.BLADE_DANCE.id);
    }
  }

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.METAMORPHOSIS_HAVOC.id).casts || 0;
  }

  get eyeBeamSeconds() {
    return (this.eyeBeamCDRemaining / 1000).toFixed(2) || 0;
  }

  get bladeDanceSeconds() {
    return (this.bladeDanceCDRemaining / 1000).toFixed(2) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.noResetEyeBeam + this.noResetBladeDance,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<> You wasted {this.noResetEyeBeam} possible <SpellLink id={SPELLS.EYE_BEAM.id} /> and {this.noResetBladeDance} possible <SpellLink id={SPELLS.BLADE_DANCE.id} /> resets.<br />
                       Please make sure these spells are on cooldown before casting <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} /> to maximize your DPS.</>)
          .icon(SPELLS.CHAOTIC_TRANSFORMATION.icon)
          .actual(i18n._(t('demonhunter.havoc.suggestions.chaoticTransformation.resetsWasted')`${(actual)} total resets wasted`))
          .recommended(`${(recommended)} is recommended.`));
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Eye Beam total seconds reduced: {this.eyeBeamSeconds} <br />
            Blade Dance total seconds reduced: {this.bladeDanceSeconds}

          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.CHAOTIC_TRANSFORMATION}>
          <SpellIcon id={SPELLS.METAMORPHOSIS_HAVOC.id} />  {this.casts} <small>Metamorphosis cast(s)</small> <br />
          <SpellIcon id={SPELLS.EYE_BEAM.id} />  {this.resetEyeBeam} <small>reset(s)</small> | {this.noResetEyeBeam} <small>wasted reset(s)</small> <br />
          <SpellIcon id={SPELLS.BLADE_DANCE.id} /> {this.resetBladeDance} <small>reset(s)</small> | {this.noResetBladeDance} <small>wasted reset(s)</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default ChaoticTransformation;
