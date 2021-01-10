import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Events, {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { getDotDurations } from '../../constants';

type TargetDotsInfo = {
  targetName: string;
  dots: DotInfo[];
};
// All numbers are timestamps
type DotInfo = {
  cast: number;
  expectedEnd: number;
  extendStart: number | null;
  extendExpectedEnd: number | null;
};

type TargetDots = {
  targetName: string;
  dots: number[];
};
type DarkglareCast = {
  timestamp: number;
  targets: {
    [target: string]: TargetDots;
  };
};

const BONUS_DURATION = 8000;
const DOT_DEBUFFS = [
  SPELLS.AGONY,
  SPELLS.CORRUPTION_DEBUFF,
  SPELLS.SIPHON_LIFE_TALENT,
  SPELLS.UNSTABLE_AFFLICTION,
  SPELLS.PHANTOM_SINGULARITY_TALENT,
  SPELLS.VILE_TAINT_TALENT,
];
const debug = false;

class Darkglare extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  _dotDurations: Record<number, number> = {};
  _hasAC = false;

  bonusDotDamage = 0;
  darkglareDamage = 0;
  casts: DarkglareCast[] = [];
  dots: Record<string, TargetDotsInfo> = {};

  constructor(options: Options) {
    super(options);
    this._dotDurations = getDotDurations(this.selectedCombatant);
    // if player has Absolute Corruption, disregard the Corruption duration (it's permanent debuff then)
    this._hasAC = this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
    if (this._hasAC) {
      delete this._dotDurations[SPELLS.CORRUPTION_DEBUFF.id];
    }

    // event listeners
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(DOT_DEBUFFS),
      this.onDotApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(DOT_DEBUFFS),
      this.onDotRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DARKGLARE),
      this._processDarkglareCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(DOT_DEBUFFS), this._processDotCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DOT_DEBUFFS), this.onDotDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SUMMON_DARKGLARE_DAMAGE),
      this.onDarkglareDamage,
    );
  }

  onDotApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    this._resetDotOnTarget(event);
  }

  onDotRemove(event: RemoveDebuffEvent) {
    const spellId = event.ability.guid;
    // possible Mythrax or other shenanigans with dotting Mind Controlled players
    if (event.targetIsFriendly) {
      return;
    }
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.dots[encoded] || !this.dots[encoded].dots[spellId]) {
      debug && console.log(`Remove debuff on not-recorded mob - ${encoded}`, event);
      return;
    }
    // remove dot from tracking
    delete this.dots[encoded].dots[spellId];
    // if it was the last dot on a mob, remove mob as well
    if (Object.values(this.dots[encoded].dots).length === 0) {
      delete this.dots[encoded];
    }
  }

  onDotDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (event.targetIsFriendly) {
      return;
    }
    // check if it's an extended dot dmg
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.dots[encoded] || !this.dots[encoded].dots[spellId]) {
      debug &&
        console.log(
          `Dot tick (${
            event.ability.name
          }) on unknown encoded target - ${encoded}, time: ${this.owner.formatTimestamp(
            event.timestamp,
            3,
          )} (${event.timestamp}), current this.dots:`,
          JSON.parse(JSON.stringify(this.dots)),
        );
      // I know this isn't entirely accurate, but it's better to be a little off than not track the dot altogether (until the first recast)
      // for example Agony casted somehow "prepull" (no applybuff or cast in logs), and extended can tick for about 20 seconds without being "recognized"
      this._resetDotOnTarget(event);
      return;
    }
    const dotInfo = this.dots[encoded].dots[spellId];
    // this also filters out Corruption damage if player has AC (extendExpectedEnd ends up NaN), which is correct (if it's permanent, it can't get extended - no actual bonus damage)
    const isExtended = dotInfo.extendStart !== null;
    const isInExtendedWindow =
      dotInfo.expectedEnd <= event.timestamp &&
      dotInfo.extendExpectedEnd !== null &&
      event.timestamp <= dotInfo.extendExpectedEnd;

    if (isExtended && isInExtendedWindow) {
      this.bonusDotDamage += event.amount + (event.absorbed || 0);
    }
  }

  onDarkglareDamage(event: DamageEvent) {
    this.darkglareDamage += event.amount + (event.absorbed || 0);
  }

  _processDarkglareCast(event: CastEvent) {
    // get all current dots on targets from this.dots, record it into this.casts
    const dgCast: DarkglareCast = {
      timestamp: event.timestamp,
      targets: {},
    };
    Object.entries(this.dots).forEach(([encoded, obj]) => {
      // convert string ID keys to numbers
      const dotIds = Object.keys(obj.dots).map((stringId) => Number(stringId));
      dgCast.targets[encoded] = {
        targetName: obj.targetName,
        dots: dotIds,
      };
      // while already iterating through the collection, modify it, filling out extendStart and extendExpectedEnd
      Object.values(obj.dots).forEach((dotInfo) => {
        dotInfo.extendStart = event.timestamp;
        // to calculate the extendExpectedEnd, we:
        // take remaining duration at the time of the cast
        const remaining = dotInfo.expectedEnd - event.timestamp;
        // add extend duration to it
        const extended = remaining + BONUS_DURATION;
        // and add it to the time of the cast
        dotInfo.extendExpectedEnd = event.timestamp + extended;
      });
    });
    this.casts.push(dgCast);
  }

  _processDotCast(event: CastEvent) {
    // if it's a dot, refresh its data in this.dots
    const spellId = event.ability.guid;
    // Corruption cast has different spell ID than the debuff (it's not in DOT_DEBUFF_IDS)
    if (
      !DOT_DEBUFFS.some((spell) => spell.id === spellId) &&
      spellId !== SPELLS.CORRUPTION_CAST.id
    ) {
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    this._resetDotOnTarget(event);
  }

  _resetDotOnTarget(event: ApplyDebuffEvent | CastEvent | DamageEvent | RefreshDebuffEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const spellId = event.ability.guid;
    const target = encodeTargetString(event.targetID, event.targetInstance);
    this.dots[target] = this.dots[target] || { targetName: enemy.name, dots: {} };
    this.dots[target].dots[spellId] = {
      cast: event.timestamp,
      expectedEnd: event.timestamp + this._dotDurations[spellId],
      extendStart: null,
      extendExpectedEnd: null,
    };
  }

  statistic() {
    let totalExtendedDots = 0;
    // for each cast, and each enemy in that cast, count the amount of dots on the enemy (disregard Corruption if player has Absolute Corruption)
    Object.values(this.casts).forEach((cast) => {
      Object.values(cast.targets).forEach((targetDots) => {
        if (this._hasAC) {
          totalExtendedDots += targetDots.dots.filter((id) => id !== SPELLS.CORRUPTION_DEBUFF.id)
            .length;
        } else {
          totalExtendedDots += targetDots.dots.length;
        }
      });
    });
    const averageExtendedDots = totalExtendedDots / this.casts.length || 0;
    const totalDamage = this.bonusDotDamage + this.darkglareDamage;

    const formatDPS = (amount: number) =>
      `${formatNumber((amount / this.owner.fightDuration) * 1000)} DPS`;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip={
          <>
            Damage from extended dots <sup>*</sup>: {formatThousands(this.bonusDotDamage)} (
            {this.owner.formatItemDamageDone(this.bonusDotDamage)})<br />
            Pet damage: {formatThousands(this.darkglareDamage)} (
            {this.owner.formatItemDamageDone(this.darkglareDamage)})<br />
            Combined damage: {formatThousands(totalDamage)} (
            {this.owner.formatItemDamageDone(totalDamage)})<br />
            <br />
            <sup>*</sup> This only counts the damage that happened after the dot{' '}
            <u>should have fallen off</u> (but instead was extended with Darkglare).
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_DARKGLARE}>
          {formatDPS(this.bonusDotDamage)}{' '}
          <TooltipElement
            content={
              <>
                damage from DoTs after they <u>should have fallen off</u>, but were extended instead
              </>
            }
          >
            <small>
              bonus damage <sup>*</sup>
            </small>
          </TooltipElement>
          <br />
          {averageExtendedDots.toFixed(1)} <small>average DoTs extended</small>
          <br />
          {formatDPS(totalDamage)}{' '}
          <TooltipElement content="including pet damage">
            <small>
              total damage <sup>*</sup>
            </small>
          </TooltipElement>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Darkglare;
