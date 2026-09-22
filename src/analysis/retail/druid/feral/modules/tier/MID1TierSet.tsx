import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { DRUID_MID1_ID } from 'common/ITEMS';
import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';

const FOUR_PIECE_RAKE_BONUS = 0.2;
const FOUR_PIECE_CC_BONUS = 0.15;
const CC_BUFFER_MS = 50;

/**
 * **Sprouts of the Luminous Bloom**
 * Feral Druid Midnight Season 1 tier set
 *
 * 2pc — Gaining Clearcasting from Omen of Clarity grants Flash of Clarity, increasing your crit
 * chance by 5% for 4 sec.
 *
 * 4pc — Rake damage increased by 20%. Clearcasting also increases Shred or Swipe damage by 15%.
 */
class MID1TierSet extends Analyzer {
  hasFourPiece = false;

  // 4pc tracking
  rakeBonusDamage = 0;
  shredCcBonusDamage = 0;
  swipeCcBonusDamage = 0;

  // 2pc tracking
  flashProcs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID1);
    if (!this.active) {
      return;
    }
    this.hasFourPiece = this.selectedCombatant.has4PieceByTier(TIERS.MID1);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_DRUID_FLASH_OF_CLARITY),
      () => {
        this.flashProcs += 1;
      },
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FERAL_DRUID_FLASH_OF_CLARITY),
      () => {
        this.flashProcs += 1;
      },
    );

    if (this.hasFourPiece) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell([SPELLS.RAKE, SPELLS.RAKE_BLEED]),
        (event: DamageEvent) => {
          this.rakeBonusDamage += calculateEffectiveDamage(event, FOUR_PIECE_RAKE_BONUS);
        },
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SHRED, SPELLS.SWIPE_CAT]),
        this.onShredSwipeDamage,
      );
    }
  }

  onShredSwipeDamage(event: DamageEvent) {
    // Shred/Swipe damage fires within a few ms of the cast, by which point Clearcasting has been
    // consumed. Use a small buffer to read the buff state as it was at cast time.
    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.CLEARCASTING_FERAL.id,
        event.timestamp,
        CC_BUFFER_MS,
        CC_BUFFER_MS,
      )
    ) {
      return;
    }
    const bonus = calculateEffectiveDamage(event, FOUR_PIECE_CC_BONUS);
    if (event.ability.guid === SPELLS.SHRED.id) {
      this.shredCcBonusDamage += bonus;
    } else {
      this.swipeCcBonusDamage += bonus;
    }
  }

  get fourPieceDamage() {
    return this.rakeBonusDamage + this.shredCcBonusDamage + this.swipeCcBonusDamage;
  }

  get flashUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.FERAL_DRUID_FLASH_OF_CLARITY.id) /
      this.owner.fightDuration
    );
  }

  get flashProcsPerMinute() {
    return this.owner.getPerMinute(this.flashProcs);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <p>
              <strong>2pc</strong> — <SpellLink spell={SPELLS.FERAL_DRUID_FLASH_OF_CLARITY} />{' '}
              grants +5% crit for 4s on each Clearcasting proc. The bonus is a crit-chance buff
              rather than a flat damage multiplier, so we don't attribute a damage number to it
              directly.
            </p>
            <ul>
              <li>
                Procs: <strong>{this.flashProcs}</strong> (
                <strong>{this.flashProcsPerMinute.toFixed(1)}</strong> per minute)
              </li>
              <li>
                Buff uptime: <strong>{formatPercentage(this.flashUptime, 1)}%</strong>
              </li>
            </ul>
            {this.hasFourPiece && (
              <>
                <p>
                  <strong>4pc</strong> damage breakdown:
                </p>
                <ul>
                  <li>
                    <SpellLink spell={SPELLS.RAKE} /> +20% (direct + bleed):{' '}
                    <strong>{formatNumber(this.rakeBonusDamage)}</strong> (
                    {formatPercentage(
                      this.owner.getPercentageOfTotalDamageDone(this.rakeBonusDamage),
                      2,
                    )}
                    %)
                  </li>
                  <li>
                    <SpellLink spell={SPELLS.SHRED} /> +15% on Clearcast consumes:{' '}
                    <strong>{formatNumber(this.shredCcBonusDamage)}</strong> (
                    {formatPercentage(
                      this.owner.getPercentageOfTotalDamageDone(this.shredCcBonusDamage),
                      2,
                    )}
                    %)
                  </li>
                  <li>
                    <SpellLink spell={SPELLS.SWIPE_CAT} /> +15% on Clearcast consumes:{' '}
                    <strong>{formatNumber(this.swipeCcBonusDamage)}</strong> (
                    {formatPercentage(
                      this.owner.getPercentageOfTotalDamageDone(this.swipeCcBonusDamage),
                      2,
                    )}
                    %)
                  </li>
                </ul>
              </>
            )}
          </>
        }
      >
        <BoringItemSetValueText setId={DRUID_MID1_ID} title="Sprouts of the Luminous Bloom">
          <div>2pc:</div>
          <div>
            <UptimeIcon /> {formatPercentage(this.flashUptime, 1)}%{' '}
            <small>
              <SpellLink spell={SPELLS.FERAL_DRUID_FLASH_OF_CLARITY} /> uptime
            </small>
          </div>
          {this.hasFourPiece && (
            <>
              <hr />
              <div>4pc:</div>
              <div>
                <ItemPercentDamageDone amount={this.fourPieceDamage} />
              </div>
            </>
          )}
        </BoringItemSetValueText>
      </Statistic>
    );
  }
}

export default MID1TierSet;
