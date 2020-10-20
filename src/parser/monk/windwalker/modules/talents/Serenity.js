import React from 'react';

import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from 'parser/monk/windwalker/constants';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';

const DAMAGE_MULTIPLIER = 0.2;

class Serenity extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  damageGain = 0;
  effectiveRisingSunKickReductionMs = 0;
  effectiveFistsOfFuryReductionMs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SERENITY_TALENT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK), this.onRSK);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_CAST), this.onFoF);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SERENITY_TALENT), this.onSerenityStart);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SERENITY_TALENT), this.onSerenityEnd);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES), this.onAffectedDamage);
  }

  _reduceRSK() {
    if (this.spellUsable.isOnCooldown(SPELLS.RISING_SUN_KICK.id)) {
      const cooldownReduction = (this.spellUsable.cooldownRemaining(SPELLS.RISING_SUN_KICK.id)) * 0.5;
      this.spellUsable.reduceCooldown(SPELLS.RISING_SUN_KICK.id, cooldownReduction);
      this.effectiveRisingSunKickReductionMs += cooldownReduction;
    }
  }

  _reduceFoF() {
    if (this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
      const cooldownReduction = (this.spellUsable.cooldownRemaining(SPELLS.FISTS_OF_FURY_CAST.id)) * 0.5;
      this.spellUsable.reduceCooldown(SPELLS.FISTS_OF_FURY_CAST.id, cooldownReduction);
      this.effectiveFistsOfFuryReductionMs += cooldownReduction;
    }
  }

  onRSK() {
    if (this.selectedCombatant.hasBuff(SPELLS.SERENITY_TALENT.id)){
      this._reduceRSK();
    }
  }

  onFoF() {
    if (this.selectedCombatant.hasBuff(SPELLS.SERENITY_TALENT.id)){
      this._reduceFoF();
    }
  }

  onSerenityStart() {
    this._reduceRSK();
    this._reduceFoF();
  }

  onSerenityEnd() {
    if (this.spellUsable.isOnCooldown(SPELLS.RISING_SUN_KICK.id)) {
      const cooldownExtension = (this.spellUsable.cooldownRemaining(SPELLS.RISING_SUN_KICK.id));
      this.spellUsable.extendCooldown(SPELLS.RISING_SUN_KICK.id, cooldownExtension);
      this.effectiveRisingSunKickReductionMs -= cooldownExtension;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
      const cooldownExtension = (this.spellUsable.cooldownRemaining(SPELLS.FISTS_OF_FURY_CAST.id));
      this.spellUsable.extendCooldown(SPELLS.FISTS_OF_FURY_CAST.id, cooldownExtension);
      this.effectiveFistsOfFuryReductionMs -= cooldownExtension;
    }
  }

  onAffectedDamage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SERENITY_TALENT.id)) {
      return;
    }
    this.damageGain += calculateEffectiveDamage(event, DAMAGE_MULTIPLIER);
  }

  get dps() {
    return this.damageGain / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={(
          <>
            Total damage increase: {formatNumber(this.damageGain)}.
            <br />
            The damage increase is calculated from the {formatPercentage(DAMAGE_MULTIPLIER)}% damage bonus and doesn't count raw damage from extra casts gained from cooldown reduction.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SERENITY_TALENT}>
          <img
            src="/img/sword.png"
            alt="Damage"
            className="icon"
          /> {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageGain))} % of total</small>
          <br />
          <span style={{ fontsize: '75%' }}>
            <SpellIcon
              id={SPELLS.RISING_SUN_KICK.id}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            /> {(this.effectiveRisingSunKickReductionMs / 1000).toFixed(1)} <small>Seconds reduced</small>
            <br />
            <SpellIcon
              id={SPELLS.FISTS_OF_FURY_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            /> {(this.effectiveFistsOfFuryReductionMs / 1000).toFixed(1)} <small>Seconds reduced</small>
          </span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Serenity;
