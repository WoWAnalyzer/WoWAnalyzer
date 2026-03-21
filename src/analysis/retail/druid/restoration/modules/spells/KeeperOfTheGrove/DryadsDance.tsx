import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, {
  ApplyBuffEvent,
  FightEndEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import { formatDuration } from 'common/format';

const SWIFTMEND_COOLDOWN_RATE_MULTIPLIER = 1.25;
const EXTRA_RECOVERY_RATE = SWIFTMEND_COOLDOWN_RATE_MULTIPLIER - 1;

/**
 * **Dryad's Dance**
 * Hero Talent - Keeper of the Grove
 *
 * Dryads cause Swiftmend to cool down 25% faster.
 */
export default class DryadsDance extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  private initialized = false;
  private activeDryadBuffIds = new Set<number>();
  private dryadRateModifierActive = false;
  private swiftmendOnCooldown = false;
  private effectiveCDR = 0;
  private wastedCDR = 0;
  private lastTimestamp = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.DRYADS_DANCE_TALENT);
    if (!this.active) {
      return;
    }

    this.lastTimestamp = this.owner.fight.start_time;

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendUpdate,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DRYAD_SPIRIT_OF_THE_THICKET_BUFF, SPELLS.SYLVAN_BECKONING_ACTIVE]),
      this.onDryadBuffApplied,
    );

    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DRYAD_SPIRIT_OF_THE_THICKET_BUFF, SPELLS.SYLVAN_BECKONING_ACTIVE]),
      this.onDryadBuffRemoved,
    );
  }

  private isDryadBuffId(spellId: number): boolean {
    return (
      spellId === SPELLS.DRYAD_SPIRIT_OF_THE_THICKET_BUFF.id ||
      spellId === SPELLS.SYLVAN_BECKONING_ACTIVE.id
    );
  }

  private isDryadActive(): boolean {
    return this.activeDryadBuffIds.size > 0;
  }

  private onDryadBuffApplied(event: ApplyBuffEvent) {
    this.accumulateCdr(event.timestamp);

    if (this.isDryadBuffId(event.ability.guid)) {
      this.activeDryadBuffIds.add(event.ability.guid);
    }

    if (this.dryadRateModifierActive) {
      return;
    }

    this.spellUsable.applyCooldownRateChange(
      SPELLS.SWIFTMEND.id,
      SWIFTMEND_COOLDOWN_RATE_MULTIPLIER,
      event.timestamp,
    );
    this.dryadRateModifierActive = true;
  }

  private onDryadBuffRemoved(event: RemoveBuffEvent) {
    this.accumulateCdr(event.timestamp);

    if (this.isDryadBuffId(event.ability.guid)) {
      this.activeDryadBuffIds.delete(event.ability.guid);
    }

    if (!this.dryadRateModifierActive || this.isDryadActive()) {
      return;
    }

    this.spellUsable.removeCooldownRateChange(
      SPELLS.SWIFTMEND.id,
      SWIFTMEND_COOLDOWN_RATE_MULTIPLIER,
      event.timestamp,
    );
    this.dryadRateModifierActive = false;
  }

  private onSwiftmendUpdate(event: UpdateSpellUsableEvent) {
    if (!this.initialized) {
      this.initialized = true;
      this.swiftmendOnCooldown = event.isOnCooldown;

      if (
        this.selectedCombatant.hasBuff(SPELLS.DRYAD_SPIRIT_OF_THE_THICKET_BUFF.id, event.timestamp)
      ) {
        this.activeDryadBuffIds.add(SPELLS.DRYAD_SPIRIT_OF_THE_THICKET_BUFF.id);
      }
      if (this.selectedCombatant.hasBuff(SPELLS.SYLVAN_BECKONING_ACTIVE.id, event.timestamp)) {
        this.activeDryadBuffIds.add(SPELLS.SYLVAN_BECKONING_ACTIVE.id);
      }

      if (this.isDryadActive() && !this.dryadRateModifierActive) {
        this.spellUsable.applyCooldownRateChange(
          SPELLS.SWIFTMEND.id,
          SWIFTMEND_COOLDOWN_RATE_MULTIPLIER,
          event.timestamp,
        );
        this.dryadRateModifierActive = true;
      }

      this.lastTimestamp = event.timestamp;
      return;
    }

    this.accumulateCdr(event.timestamp);
    this.swiftmendOnCooldown = event.isOnCooldown;
  }

  private onFightEnd(event: FightEndEvent) {
    this.accumulateCdr(event.timestamp);
  }

  private accumulateCdr(timestamp: number) {
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (delta <= 0 || !this.dryadRateModifierActive) {
      return;
    }

    const bonusCdr = delta * EXTRA_RECOVERY_RATE;
    if (this.swiftmendOnCooldown) {
      this.effectiveCDR += bonusCdr;
    } else {
      this.wastedCDR += bonusCdr;
    }
  }

  statistic() {
    this.accumulateCdr(this.owner.currentTimestamp);

    const dryadSpiritUptime = this.selectedCombatant.getBuffUptime(
      SPELLS.DRYAD_SPIRIT_OF_THE_THICKET_BUFF.id,
    );
    const sylvanBeckoningUptime = this.selectedCombatant.getBuffUptime(
      SPELLS.SYLVAN_BECKONING_ACTIVE.id,
    );
    const effectiveCDRSeconds = (this.effectiveCDR / 1000).toFixed(2);
    const wastedCDRSeconds = (this.wastedCDR / 1000).toFixed(2);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <strong>Dryad Spirit uptime:</strong> {formatDuration(dryadSpiritUptime)}
            <br />
            <strong>Sylvan Beckoning uptime:</strong> {formatDuration(sylvanBeckoningUptime)}
            <br />
            <strong>Effective CDR:</strong> {formatDuration(this.effectiveCDR)} (
            {effectiveCDRSeconds}s)
            <br />
            <strong>Wasted CDR:</strong> {formatDuration(this.wastedCDR)} ({wastedCDRSeconds}s)
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.DRYADS_DANCE_TALENT}>
          <ItemCooldownReduction
            effective={this.effectiveCDR}
            waste={this.wastedCDR > 0 ? this.wastedCDR : undefined}
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
