import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import UptimeIcon from 'interface/icons/Uptime';
import CooldownIcon from 'interface/icons/Cooldown';
import { formatPercentage, formatNumber, formatThousands, formatDuration } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import AlwaysBeCasting from './AlwaysBeCasting';

class WaterElemental extends Analyzer {
  static dependencies = {
    abc: AlwaysBeCasting,
  };
  protected abc!: AlwaysBeCasting;

  beginCastSpell?: BeginCastEvent;

  _waterboltsCancelled = 0;
  _waterboltsCastStarts = 0;
  _waterboltHits = 0;
  _waterboltDamage = 0;
  wasCastStarted = false;
  petActiveTime = 0;
  _timestampLastFinish = 0;
  _timestampLastCast = 0;
  _timestampFirstCast = 0;

  constructor(options: any) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id);

    this.addEventListener(Events.begincast.by(SELECTED_PLAYER_PET).spell(SPELLS.WATERBOLT), this.onWaterboltBeginCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET).spell(SPELLS.WATERBOLT), this.onWaterboltCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.WATERBOLT), this.onWaterboltDamage);
  }

  onWaterboltBeginCast(event: BeginCastEvent) {
    if (this.wasCastStarted) {
        this._waterboltsCancelled += 1;
    }
    if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
      this._timestampFirstCast = event.timestamp;
    }
    this.beginCastSpell = event;
    this.wasCastStarted = true;
    this._timestampLastCast = event.timestamp;
  }

  onWaterboltCast(event: CastEvent) {
    if (this.beginCastSpell && this.beginCastSpell.ability.guid !== event.ability.guid && this.wasCastStarted) {
        this._waterboltsCancelled += 1;
    } else {
      this._waterboltsCastStarts += 1;
      this._timestampLastFinish = event.timestamp;
      if (this._timestampLastCast === 0) {
        //in case casting was started before going infight
        this._timestampLastCast = this.owner.fight.start_time;
      }
      if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
        this._timestampFirstCast = event.timestamp;
      }
      this.petActiveTime += this._timestampLastFinish - this._timestampLastCast;
    }
    this.wasCastStarted = false;
  }

  onWaterboltDamage(event: DamageEvent) {
    if (this._waterboltHits === 0 && this._timestampFirstCast === 0) {
      this._timestampFirstCast = event.timestamp;
    }
    this._waterboltHits += 1;
    this._waterboltDamage += event.amount + (event.absorbed || 0);
  }

  get petDowntimePercentage() {
    return 1 - this.petActiveTimePercentage;
  }

  get petActiveTimePercentage() {
    return this.petActiveTime / this.owner.fightDuration;
  }

  get prepullSummonCheck() {
    return this._timestampFirstCast - this.owner.fight.start_time;
  }

  get petTotalCasts() {
    return this._waterboltsCancelled + this._waterboltsCastStarts;
  }


  //checks for difference between player and pet uptime
  get waterElementalUptimeThresholds() {
    return {
      actual: this.petActiveTimePercentage,
      isLessThan: {
        minor: this.abc.activeTimePercentage - 0.10, // eg. player has 83% so the pet can have 73%
        average: this.abc.activeTimePercentage - 0.25,
        major: this.abc.activeTimePercentage -0.30,
      },
      style: 'percentage',
    };
  }

  //checks for the time between pull and first action (begin cast/cast/damage) from pet
  get waterElementalPrepullThresholds() {
    return {
      actual: Math.abs(this.prepullSummonCheck),
      isGreaterThan: {
        minor: 5000, //
        average: 10000, // 5 - 10 seconds after pull should give the player time for fetid/mythrax-like pulls
        major: 20000, //
      },
      style: 'number',
    };
  }

  suggestions(when: any) {
    when(this.waterElementalUptimeThresholds)
    .addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>
                      Your <SpellLink id={SPELLS.SUMMON_WATER_ELEMENTAL.id} /> uptime can be improved.
                      The uptime of your Water Elemental should more or less mirror your own uptime, higher being better.
                      Ensure you have your it summoned pre-pull and that it's always attacking.
                      </>)
          .icon(SPELLS.SUMMON_WATER_ELEMENTAL.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`mirroring your own uptime (${formatPercentage(this.abc.activeTimePercentage)}% or more) is recommended`);
      });
    when(this.waterElementalPrepullThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>
                      Your Water Elemental should be able to cast Waterbolt right when the fight starts. Therefore, cast <SpellLink id={SPELLS.SUMMON_WATER_ELEMENTAL.id} /> before the fight.
                      </>)
          .icon(SPELLS.WATERBOLT.icon)
          .actual(`${(this._timestampFirstCast === 0 ? 'Never attacked or not summoned' : 'First attack: ' + formatDuration((this._timestampFirstCast - this.owner.fight.start_time)/1000) + ' into the fight')}`)
          .recommended(`summoning pre-fight is recommended`);
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(60)}
        size="flexible"
        tooltip={(
          <>
            Water Elemental was casting for {formatPercentage(this.petActiveTimePercentage)} % of the fight (Downtime: {formatPercentage(this.petDowntimePercentage)} %).<br />
            Your Water Elemental began casting {this.petTotalCasts} times.<br />
            <ul>
              <li>{this._waterboltHits} casts dealt a total damage of {formatThousands(this._waterboltDamage)}.</li>
              <li>{this._waterboltsCancelled} casts were cancelled.</li>
              <li>{this.petTotalCasts - this._waterboltsCancelled - this._waterboltHits} did not hit a target in time.</li>
            </ul>
          </>
        )}
      >
        <BoringValueText label="Water Elemental">
          <UptimeIcon /> {formatPercentage(this.petActiveTimePercentage)}% <small>Pet uptime</small><br />
          <CooldownIcon /> {formatNumber(this._waterboltDamage / (this.owner.fightDuration / 1000))} <small>Pet DPS</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default WaterElemental;
