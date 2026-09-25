import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const MAX_STACKS = 2;
const REAPERS_MARK_STACKS = 2;
const DANCING_RUNE_WEAPON_STACKS = 1;
// the buff from a Dancing Rune Weapon cast can land a little after the cast.
const DANCING_RUNE_WEAPON_WINDOW_MS = 250;
const EXTERMINATE_DURATION_MS = 30_000;
// the consuming cast is emitted before the buff removal, but allow a little slack for log jitter.
const CONSUME_WINDOW_MS = 100;

const EXTERMINATE_CONSUMER_IDS: number[] = [
  talents.MARROWREND_TALENT.id,
  talents.OBLITERATE_TALENT.id,
];

type WasteReason = 'overcap' | 'expired';

interface WasteRecord {
  timestamp: number;
  reason: WasteReason;
  stacks: number;
}

/**
 * Tracks {@link talents.EXTERMINATE_TALENT Exterminate} stacks that were never used, either because
 * the buff fell off with stacks remaining or because stacks were gained while already capped.
 *
 * A Reaper's Mark pop grants 2 stacks and a Dancing Rune Weapon cast grants 1, but the log only
 * shows a buff application for each, so the stacks are tracked here. A gain is attributed to
 * Dancing Rune Weapon if the cast just happened, and to Reaper's Mark otherwise.
 *
 * Stacks are used up by the Exterminate hits that follow an empowered Marrowrend/Obliterate rather
 * than by the buff events, since the log doesn't always show each stack dropping. The buff being
 * removed without a consuming cast is the only signal that stacks expired, so stacks left over after
 * a consume are expired once the buff duration has passed. The log doesn't say how many stacks a
 * buff that was already up at the pull had, so it's assumed to be 1.
 */
export default class WastedExterminate extends Analyzer {
  private stacks = 0;
  private activeBuffs = new Set<number>();
  private lastDancingRuneWeaponCast: number | undefined = undefined;
  private lastConsumeTimestamp: number | undefined = undefined;
  private expiresAt: number | undefined = undefined;

  private gained = 0;
  private hadPrepullBuff = false;
  private records: WasteRecord[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.EXTERMINATE_TALENT);

    for (const buff of [SPELLS.EXTERMINATE_BUFF, SPELLS.EXTERMINATE_PAINFUL_DEATH_BUFF]) {
      this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(buff), this.onApply);
      this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(buff), this.onGain);
      this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(buff), this.onRefresh);
      this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(buff), this.onRemove);
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.DANCING_RUNE_WEAPON_TALENT),
      (event: CastEvent) => {
        this.lastDancingRuneWeaponCast = event.timestamp;
      },
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.fightend, this.onFightEnd);
    // each empowered cast triggers a first and a second hit. count the first.
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXTERMINATE_FIRST_HIT),
      this.onExterminateHit,
    );
  }

  private onFightEnd(event: FightEndEvent) {
    this.expireStaleStacks(event.timestamp);
  }

  /**
   * The log doesn't show the buff ending while stacks are still left after the first one is used,
   * so stacks that outlast the buff duration are expired here.
   */
  private expireStaleStacks(now: number) {
    if (this.stacks > 0 && this.expiresAt !== undefined && now >= this.expiresAt) {
      this.records.push({ timestamp: this.expiresAt, reason: 'expired', stacks: this.stacks });
      this.stacks = 0;
    }
  }

  private onExterminateHit() {
    this.stacks = Math.max(0, this.stacks - 1);
  }

  private onCast(event: CastEvent) {
    if (EXTERMINATE_CONSUMER_IDS.includes(event.ability.guid)) {
      this.lastConsumeTimestamp = event.timestamp;
    }
  }

  private isConsume(timestamp: number) {
    return (
      this.lastConsumeTimestamp !== undefined &&
      timestamp - this.lastConsumeTimestamp <= CONSUME_WINDOW_MS
    );
  }

  private onApply(event: ApplyBuffEvent) {
    this.activeBuffs.add(event.ability.guid);
    if (event.__fromCombatantinfo || event.prepull || event.__fabricated) {
      // Already up when the fight started, so the stack count isn't known. Assuming 1 to be conservative.
      this.hadPrepullBuff = true;
      this.gained += 1;
      this.stacks = 1;
      return;
    }
    this.onGain(event);
  }

  private onGain(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    const fromDancingRuneWeapon =
      this.lastDancingRuneWeaponCast !== undefined &&
      event.timestamp - this.lastDancingRuneWeaponCast <= DANCING_RUNE_WEAPON_WINDOW_MS;
    const amount = fromDancingRuneWeapon ? DANCING_RUNE_WEAPON_STACKS : REAPERS_MARK_STACKS;

    this.expireStaleStacks(event.timestamp);

    const wasted = Math.max(0, this.stacks + amount - MAX_STACKS);
    this.expiresAt = event.timestamp + EXTERMINATE_DURATION_MS;
    this.gained += amount;
    this.stacks = Math.min(MAX_STACKS, this.stacks + amount);
    if (wasted > 0) {
      this.records.push({ timestamp: event.timestamp, reason: 'overcap', stacks: wasted });
    }
  }

  private onRefresh(event: RefreshBuffEvent) {
    // consuming a stack also logs a refresh. anything else is a gain at the cap.
    if (!this.isConsume(event.timestamp)) {
      this.onGain(event);
    }
  }

  private onRemove(event: RemoveBuffEvent) {
    this.activeBuffs.delete(event.ability.guid);
    if (this.isConsume(event.timestamp)) {
      // the stacks used are accounted for by the Exterminate hits
      return;
    }

    // going from one exterminate buff to the other is apply -> remove, so this isn't a real drop
    const swapped = this.activeBuffs.size > 0;
    const fightEnded = event.timestamp >= this.owner.fight.end_time;
    if (this.stacks > 0 && !swapped && !fightEnded) {
      this.records.push({ timestamp: event.timestamp, reason: 'expired', stacks: this.stacks });
    }
    if (!swapped) {
      this.stacks = 0;
    }
  }

  get overcappedStacks() {
    return this.sumStacks('overcap');
  }

  get expiredStacks() {
    return this.sumStacks('expired');
  }

  get wastedStacks() {
    return this.overcappedStacks + this.expiredStacks;
  }

  private sumStacks(reason: WasteReason) {
    return this.records
      .filter((record) => record.reason === reason)
      .reduce((total, record) => total + record.stacks, 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <div>
              {this.wastedStacks} of {this.gained} stacks wasted: {this.expiredStacks} expired
              unused and {this.overcappedStacks} gained while at {MAX_STACKS} stacks.
            </div>
            {this.hadPrepullBuff && (
              <div>
                <SpellLink spell={talents.EXTERMINATE_TALENT} /> was already active at the start of
                the fight. The number of stacks can't be determined from the log, so 1 stack was
                assumed.
              </div>
            )}
          </>
        }
        dropdown={
          this.records.length > 0 && (
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Stacks</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {this.records.map((record, index) => (
                  <tr key={index}>
                    <th>{formatDuration(record.timestamp - this.owner.fight.start_time)}</th>
                    <td>{record.stacks}</td>
                    <td>{record.reason === 'overcap' ? 'Gained while capped' : 'Expired'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      >
        <BoringSpellValueText spell={talents.EXTERMINATE_TALENT}>
          {this.wastedStacks} <small>wasted stacks</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
