import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SPELLS from "common/SPELLS/index";
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatNumber } from "common/format";
import SpellLink from "common/SpellLink";

let COOLDOWN_REDUCTION_MS = 12000;

class DireBeast extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  DBCasts = 0;
  effectiveBWReduction = 0;
  wastedBWReduction = 0;
  BestialWrathCast = 0;
  badDBCasts = 0;
  DireBeastCastsSinceLastBW = 0;
  remainingBestialWrathCooldown = 0;

  on_initialized() {
    this.active = !this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST.id && spellId !== SPELLS.BESTIAL_WRATH.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T19_4P_BONUS.id)) {
      COOLDOWN_REDUCTION_MS = 16000;
    }
    if (spellId === SPELLS.DIRE_BEAST.id) {
      this.DBCasts += 1;
      const bestialWrathIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.BESTIAL_WRATH.id);
      if (bestialWrathIsOnCooldown) {
        this.remainingBestialWrathCooldown = this.spellUsable.cooldownRemaining(SPELLS.BESTIAL_WRATH.id);
        const reductionMs = this.spellUsable.reduceCooldown(SPELLS.BESTIAL_WRATH.id, COOLDOWN_REDUCTION_MS);
        if (this.remainingBestialWrathCooldown > 3000) {
          this.effectiveBWReduction += reductionMs;
          this.wastedBWReduction += (COOLDOWN_REDUCTION_MS - reductionMs);
        } else {
          this.badDBCasts += 1;
          this.effectiveBWReduction += reductionMs;
          this.wastedBWReduction += (COOLDOWN_REDUCTION_MS - reductionMs);
        }
      } else {
        this.wastedBWReduction += COOLDOWN_REDUCTION_MS;
        this.badDBCasts += 1;
      }
      this.DireBeastCastsSinceLastBW += 1;
    }
    if (spellId === SPELLS.BESTIAL_WRATH.id) {
      this.BestialWrathCast = event.timestamp;
      this.DireBeastCastsSinceLastBW = 0;
    }
  }

  statistic() {
    const gainedBestialWraths = this.effectiveBWReduction / 90000;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIRE_BEAST.id} />}
        value={(
          <span>
            {`gained `}{formatNumber(gainedBestialWraths, 1)}{'  '}
            <SpellIcon
              id={SPELLS.BESTIAL_WRATH.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            <br />
            {this.DBCasts}{'  '}
            <SpellIcon
              id={SPELLS.DIRE_BEAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {'  '}
            {this.badDBCasts}{'  '}
            <SpellIcon
              id={SPELLS.DIRE_BEAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
                filter: 'grayscale(100%)',
              }}
            />
          </span>
        )}
        label={`Direbeast information`}
        tooltip={`You cast Dire Beast ${this.DBCasts} times. <br/> <ul> <li>This reduced Bestial Wraths cooldown by ${(this.effectiveBWReduction / 1000).toFixed(1)} seconds in total, which resulted in you gaining ${formatNumber(gainedBestialWraths, 2)} extra Bestial Wrath casts. </li> <li>You lost out on ${this.wastedBWReduction / 1000} seconds of CD reduction by casting Dire Beast while Bestial Wrath wasn't on cooldown or while cooldown had less than ${COOLDOWN_REDUCTION_MS / 1000} seconds remaining. </li><li> You cast ${this.badDBCasts} Dire Beasts while there was less than 3 seconds remaining of Bestial Wrath cooldown.</li></ul>`}
      />
    );
  }
  suggestions(when) {
    when(this.badDBCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Delay casting <SpellLink id={SPELLS.DIRE_BEAST.id}/> if there is less than 3 seconds cooldown remaining on <SpellLink id={SPELLS.BESTIAL_WRATH.id}/>.</span>)
          .icon(SPELLS.DIRE_BEAST_SUMMON.icon)
          .actual(`You cast Dire Beast ${this.badDBCasts} times when Bestial Wrath had less than 3 seconds CD remaining`)
          .recommended(`${recommended} is recommended`)
          .regular(recommended)
          .major(recommended + 1);
      });
  }

}

export default DireBeast;
