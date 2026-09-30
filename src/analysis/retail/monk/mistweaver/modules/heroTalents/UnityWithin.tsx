import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { SpellLink } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellIcon from 'interface/SpellIcon';
import { TooltipElement } from 'interface/Tooltip';
import StrengthOfTheBlackOx, { HealingSource } from './StrengthOfTheBlackOx';
import HeartOfTheJadeSerpent from '../spells/HeartOfTheJadeSerpent';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// the tiger has travel time and hits more than once, landing 2-3s after the unity within trigger
const UNITY_COURAGE_WINDOW_MS = 3000;
// the buff fade and the heart buff can both open the same unity within
const UNITY_DEDUPE_MS = 500;

interface UnityCast {
  redCrane: boolean;
  whiteTiger: boolean;
  blackOx: boolean;
  jadeSerpent: boolean;
}

class UnityWithin extends Analyzer.withDependencies({
  strengthOfTheBlackOx: StrengthOfTheBlackOx,
  heartOfTheJadeSerpent: HeartOfTheJadeSerpent,
}) {
  talent = TALENTS_MONK.UNITY_WITHIN_TALENT;
  redCraneHealing = 0;
  whiteTigerHealing = 0;
  whiteTigerDamage = 0;
  lastUnityTimestamp = Number.MIN_SAFE_INTEGER;
  casts: UnityCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.UNITY_WITHIN_BUFF),
      this.onUnityWithin,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLIGHT_OF_THE_RED_CRANE_UNITY),
      this.onRedCraneHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.COURAGE_OF_THE_WHITE_TIGER_HEAL),
      this.onWhiteTigerHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.COURAGE_OF_THE_WHITE_TIGER_DAMAGE),
      this.onWhiteTigerDamage,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD),
      this.onBlackOxShield,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD),
      this.onBlackOxShield,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY),
      this.onJadeSerpent,
    );
  }

  onUnityWithin(event: RemoveBuffEvent) {
    this.openCast(event.timestamp);
  }

  // the buff removal and heart buff can land on the same timestamp in any order
  private openCast(timestamp: number): UnityCast {
    if (timestamp - this.lastUnityTimestamp > UNITY_DEDUPE_MS) {
      this.casts.push({ redCrane: false, whiteTiger: false, blackOx: false, jadeSerpent: false });
    }
    this.lastUnityTimestamp = timestamp;
    return this.currentCast!;
  }

  get currentCast(): UnityCast | undefined {
    return this.casts.at(-1);
  }

  missed(celestial: keyof UnityCast) {
    return this.casts.filter((cast) => !cast[celestial]).length;
  }

  isUnityCourage(timestamp: number): boolean {
    return timestamp - this.lastUnityTimestamp <= UNITY_COURAGE_WINDOW_MS;
  }

  onRedCraneHeal(event: HealEvent) {
    this.redCraneHealing += event.amount + (event.absorbed || 0);
    if (this.currentCast) {
      this.currentCast.redCrane = true;
    }
  }

  onWhiteTigerHeal(event: HealEvent) {
    if (this.isUnityCourage(event.timestamp)) {
      this.whiteTigerHealing += event.amount + (event.absorbed || 0);
      this.currentCast!.whiteTiger = true;
    }
  }

  onWhiteTigerDamage(event: DamageEvent) {
    if (this.isUnityCourage(event.timestamp)) {
      this.whiteTigerDamage += event.amount + (event.absorbed || 0);
      this.currentCast!.whiteTiger = true;
    }
  }

  onBlackOxShield(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.deps.strengthOfTheBlackOx.isUnityTriggered(event.timestamp)) {
      this.currentCast!.blackOx = true;
    }
  }

  // the unity heart buff is logged just before the unity fade on the same timestamp
  onJadeSerpent(event: ApplyBuffEvent) {
    this.openCast(event.timestamp).jadeSerpent = true;
  }

  // compact version of ItemHealingDone so small values do not wrap the panel
  // TODO: possible replace once healing numbers are above 10k
  compactHealing(amount: number) {
    return (
      <>
        <img src="/img/healing.png" alt="Healing" className="icon" />{' '}
        {formatNumber(this.owner.getPerSecond(amount))} HPS{' '}
        <small>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(amount))}%</small>
      </>
    );
  }

  get blackOxHealing() {
    return this.deps.strengthOfTheBlackOx.getHealing(HealingSource.UnityShield);
  }

  get healing() {
    return this.redCraneHealing + this.whiteTigerHealing + this.blackOxHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <ul>
            <li>Casts: {this.casts.length}</li>
            {this.missed('redCrane') > 0 && (
              <li>
                <SpellLink spell={SPELLS.FLIGHT_OF_THE_RED_CRANE_UNITY} /> did not fire:{' '}
                {this.missed('redCrane')}
              </li>
            )}
            {this.missed('whiteTiger') > 0 && (
              <li>
                <SpellLink spell={SPELLS.COURAGE_OF_THE_WHITE_TIGER_HEAL} /> did not fire (likely
                due to being out of range): {this.missed('whiteTiger')}
              </li>
            )}
            {this.missed('blackOx') > 0 && (
              <li>
                <SpellLink spell={SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD} /> did not fire:{' '}
                {this.missed('blackOx')}
              </li>
            )}
            {this.deps.heartOfTheJadeSerpent.active && this.missed('jadeSerpent') > 0 && (
              <li>
                <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> did not fire:{' '}
                {this.missed('jadeSerpent')}
              </li>
            )}
            {this.deps.strengthOfTheBlackOx.hasStampede && (
              <li>
                <SpellLink spell={TALENTS_MONK.STAMPEDE_OF_THE_ANCIENTS_TALENT} /> boosted a shield
                on {this.deps.strengthOfTheBlackOx.unityBatchesWithTarget} of these casts
                {this.deps.strengthOfTheBlackOx.unityBatchesWithoutTarget > 0 && (
                  <ul>
                    <li>
                      {this.deps.strengthOfTheBlackOx.unityBatchesWithoutTarget} cast
                      {this.deps.strengthOfTheBlackOx.unityBatchesWithoutTarget === 1
                        ? ' was'
                        : 's were'}{' '}
                      not on a friendly target, so no shield was boosted. Casting{' '}
                      <SpellLink spell={this.talent} /> on an ally gives it a primary target, though
                      the boosted shield can still land on someone else.
                    </li>
                  </ul>
                )}
              </li>
            )}
          </ul>
        }
      >
        <TalentSpellText talent={this.talent}>
          {this.deps.heartOfTheJadeSerpent.active && (
            <div>
              <SpellIcon spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} />{' '}
              <>
                ≈ {this.deps.heartOfTheJadeSerpent.unityExtraCasts.toFixed(1)}{' '}
                <small>extra casts</small>
              </>
            </div>
          )}
          <div>
            <SpellIcon spell={SPELLS.COURAGE_OF_THE_WHITE_TIGER_HEAL} />{' '}
            <TooltipElement content={<ItemDamageDone amount={this.whiteTigerDamage} />}>
              {this.compactHealing(this.whiteTigerHealing)}
            </TooltipElement>
          </div>
          <div>
            <SpellIcon spell={SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD} />{' '}
            {this.compactHealing(this.blackOxHealing)}
          </div>
          <div>
            <SpellIcon spell={SPELLS.FLIGHT_OF_THE_RED_CRANE_UNITY} />{' '}
            <TooltipElement
              content={
                <>
                  <SpellLink spell={SPELLS.FLIGHT_OF_THE_RED_CRANE_UNITY} /> stayed as a bonus to{' '}
                  <SpellLink spell={this.talent} /> after it was removed as a hero talent.
                </>
              }
            >
              {this.compactHealing(this.redCraneHealing)}
            </TooltipElement>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default UnityWithin;
