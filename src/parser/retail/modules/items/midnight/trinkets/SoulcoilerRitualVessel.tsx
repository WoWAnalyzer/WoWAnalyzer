import ITEMS from 'common/ITEMS/midnight/trinkets';
import SPELLS from 'common/SPELLS/midnight/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { formatDuration, formatNumber } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellIcon } from 'interface';

/**
 * Use: Call forth 5 Soulcoiler Cultist spirits over 2 sec and sacrifice their essence,
 * each granting an ally a barrier reducing damage taken by 50% for 20 sec or until 300466 damage has been prevented.
 * Allied deaths reduce this cooldown by 30 sec and immediately summon a Soulcoil Cultist spirit for sacrifice. (2 Min Cooldown)
 *
 * https://www.wowhead.com/item=270162/
 */

const COOLDOWN_SECONDS = 120;

interface TrinketUse {
  timestamp: number;
  targets: Set<number>;
  barriers: number;
  applied: number;
  absorb: number;
  expired: number;
  removalsWithAbsorb: number;
}

export default class SoulcoilerRitualVessel extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;
  protected totalAbsorb = 0;
  protected uses: TrinketUse[] = [];
  protected barrierOwner = new Map<number, TrinketUse>();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(ITEMS.SOULCOILER_RITUAL_VESSEL.id);
    if (!this.active) {
      return;
    }

    const { abilities } = options as Options & { abilities: Abilities };
    abilities.add({
      spell: SPELLS.SOULCOILER_RITUAL_VESSEL.id,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: COOLDOWN_SECONDS,
      gcd: null,
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SOULCOILER_RITUAL_VESSEL),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SOULCOIL_BARRIER),
      this.onApplyBarrier,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOULCOIL_BARRIER),
      this.onApplyBarrier,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SOULCOIL_BARRIER),
      this.onApplyBarrier,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.SOULCOIL_BARRIER),
      this.onAbsorb,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SOULCOIL_BARRIER),
      this.onRemoveBarrier,
    );
  }

  private useForTarget(targetID: number): TrinketUse | undefined {
    return this.barrierOwner.get(targetID) ?? this.currentUse;
  }

  private get currentUse(): TrinketUse | undefined {
    return this.uses[this.uses.length - 1];
  }

  private onCast(event: CastEvent) {
    this.uses.push({
      timestamp: event.timestamp,
      targets: new Set<number>(),
      barriers: 0,
      applied: 0,
      absorb: 0,
      expired: 0,
      removalsWithAbsorb: 0,
    });
  }

  private onApplyBarrier(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    const use = this.currentUse;
    if (!use) {
      return;
    }
    // Every barrier is counted, including those from allied deaths.
    // They are attached to the latest cast and never create a cast of their own.
    use.targets.add(event.targetID);
    use.barriers += 1;
    this.barrierOwner.set(event.targetID, use);
    // The buff event carries the real size of the barrier,
    // which includes the player's own healing bonuses like versatility.
    use.applied += (event as { absorb?: number }).absorb ?? 0;
  }

  private onAbsorb(event: AbsorbedEvent) {
    this.totalAbsorb += event.amount;
    const use = this.useForTarget(event.targetID);
    if (use) {
      use.absorb += event.amount;
    }
  }

  private onRemoveBarrier(event: RemoveBuffEvent) {
    const use = this.useForTarget(event.targetID);
    this.barrierOwner.delete(event.targetID);
    if (!use) {
      return;
    }
    // WCL reports the leftover shield of a removed absorb as overheal.
    const leftover = (event as { absorb?: number }).absorb;
    if (typeof leftover === 'number') {
      use.expired += leftover;
      use.removalsWithAbsorb += 1;
    }
  }

  private unusedAbsorb(use: TrinketUse) {
    if (use.removalsWithAbsorb > 0) {
      return use.expired;
    }
    return Math.max(0, use.applied - use.absorb);
  }

  get totalCasts() {
    return this.uses.length;
  }

  get totalBarriers() {
    return this.uses.reduce((sum, use) => sum + use.barriers, 0);
  }

  get totalUnusedAbsorb() {
    return this.uses.reduce((sum, use) => sum + this.unusedAbsorb(use), 0);
  }

  get averageAbsorbPerUse() {
    if (this.uses.length === 0) return 0;
    return this.totalAbsorb / this.uses.length;
  }

  statistic() {
    const useRows = this.uses.map((use, index) => {
      const castTime = use.timestamp - this.owner.fight.start_time;
      return (
        <tr key={index}>
          <td>{formatDuration(castTime)}</td>
          <td>{use.targets.size}</td>
          <td>{use.barriers}</td>
          <td>{formatNumber(use.applied)}</td>
          <td>{formatNumber(use.absorb)}</td>
          <td>{formatNumber(this.unusedAbsorb(use))}</td>
        </tr>
      );
    });

    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        wide={true}
        tooltip={
          <>
            <p>
              Casts: <b>{this.totalCasts}</b>. Barriers applied: <b>{this.totalBarriers}</b>.
            </p>
            <p>
              Total absorb: <b>{formatNumber(this.totalAbsorb)}</b>. Not consumed:{' '}
              <b>{formatNumber(this.totalUnusedAbsorb)}</b>.
            </p>
            <p>
              Applied is the sum of the barrier sizes reported by the buff events, so it includes
              your own healing bonuses. Not consumed is the shield left when a barrier is removed
              (the same value WCL shows as overheal). Barriers from allied deaths are included in
              the barrier count.
            </p>
          </>
        }
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Time</th>
                <th>Players</th>
                <th>Barriers</th>
                <th>Applied</th>
                <th>Absorbed</th>
                <th>Not consumed</th>
              </tr>
            </thead>
            <tbody>{useRows}</tbody>
          </table>
        }
      >
        <BoringItemValueText item={ITEMS.SOULCOILER_RITUAL_VESSEL}>
          <div>
            <ItemHealingDone amount={this.totalAbsorb} />
          </div>
          <div>
            <SpellIcon spell={SPELLS.SOULCOIL_BARRIER} /> {formatNumber(this.averageAbsorbPerUse)}{' '}
            <small>average absorb per use</small>
          </div>
          <div>
            {this.totalCasts} <small>casts</small>, {this.totalBarriers}{' '}
            <small>barriers applied</small>
          </div>
          <div>
            {formatNumber(this.totalUnusedAbsorb)} <small>absorb not consumed</small>
          </div>
        </BoringItemValueText>
      </Statistic>
    );
  }
}
