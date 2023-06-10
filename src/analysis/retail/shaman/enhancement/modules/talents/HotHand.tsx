import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { Intervals } from '../core/Intervals';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { ReactNode } from 'react';

interface HotHandRank {
  modRate: number;
  increase: number;
}

const HOT_HAND: Record<number, HotHandRank> = {
  1: { modRate: 2.5, increase: 0.4 },
  2: { modRate: 4, increase: 0.6 },
};

interface HotHandProc extends SpellCast {
  buffedCasts: number;
  fillerSpells: CastEvent[];
}

/**
 * Melee auto-attacks with Flametongue Weapon active have a 5% chance to
 * reduce the cooldown of Lava Lash by [60/75]% and increase the damage of
 * Lava Lash by [20/40]% for 8 sec.
 *
 * Example Log:
 *
 */
class HotHand extends MajorCooldown<HotHandProc> {
  description(): ReactNode {
    throw new Error('Method not implemented.');
  }
  explainPerformance(cast: HotHandProc): SpellUse {
    throw new Error('Method not implemented.');
  }
  static dependencies = {
    ...MajorCooldown.dependencies,
    spellUsable: SpellUsable,
    haste: Haste,
  };
  protected spellUsable!: SpellUsable;
  protected haste!: Haste;

  protected hotHand!: HotHandRank;
  protected buffedLavaLashDamage: number = 0;
  protected hotHandActive: Intervals = new Intervals();
  protected buffedCasts: number = 0;

  constructor(options: Options) {
    super({ spell: TALENTS_SHAMAN.LAVA_LASH_TALENT }, options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.HOT_HAND_TALENT);
    if (!this.active) {
      return;
    }

    this.hotHand = HOT_HAND[this.selectedCombatant.getTalentRank(TALENTS_SHAMAN.HOT_HAND_TALENT)];

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.applyHotHand,
    );

    // Very unlikely to happen but it does.
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.refreshHotHand,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOT_HAND_BUFF),
      this.removeHotHand,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.LAVA_LASH_TALENT),
      this.onLavaLashDamage,
    );
  }

  applyHotHand(event: ApplyBuffEvent) {
    // on application both resets the CD and applies a mod rate
    this.spellUsable.endCooldown(TALENTS_SHAMAN.LAVA_LASH_TALENT.id);
    this.spellUsable.applyCooldownRateChange(
      TALENTS_SHAMAN.LAVA_LASH_TALENT.id,
      this.hotHand.modRate,
    );
    this.hotHandActive.startInterval(event.timestamp);
  }

  refreshHotHand() {
    // on refresh, we only need to reset the CD, since we've already applied the mod rate
    this.spellUsable.endCooldown(TALENTS_SHAMAN.LAVA_LASH_TALENT.id);
  }

  removeHotHand(event: RemoveBuffEvent) {
    this.spellUsable.removeCooldownRateChange(
      TALENTS_SHAMAN.LAVA_LASH_TALENT.id,
      this.hotHand.modRate,
    );

    this.hotHandActive.endInterval(event.timestamp);
  }

  onLavaLashDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id)) {
      return;
    }

    this.buffedCasts += 1;
    this.buffedLavaLashDamage += calculateEffectiveDamage(event, this.hotHand.increase);
  }

  get timePercentageHotHandsActive() {
    return this.hotHandActive.totalDuration / this.owner.fightDuration;
  }

  get castsPerSecond() {
    return this.buffedCasts / this.hotHandActive.intervalsCount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <ul>
            <li>
              Gained buff {this.hotHandActive.intervalsCount} times (
              {formatPercentage(this.timePercentageHotHandsActive)}% uptime)
            </li>
            <li>
              {this.buffedCasts} total <SpellLink id={TALENTS_SHAMAN.LAVA_LASH_TALENT} /> casts with
              Hot Hand buff
            </li>
          </ul>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.HOT_HAND_TALENT.id}>
          <>
            <ItemDamageDone amount={this.buffedLavaLashDamage} />
            <br />
            {this.castsPerSecond.toFixed(2)} <small>average casts per proc</small>
            <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HotHand;
