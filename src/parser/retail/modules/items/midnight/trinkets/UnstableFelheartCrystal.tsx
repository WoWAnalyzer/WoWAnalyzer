import ITEMS from 'common/ITEMS/midnight/trinkets';
import SPELLS from 'common/SPELLS/midnight/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Combatants from 'parser/shared/modules/Combatants';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { formatDuration, formatNumber } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellIcon } from 'interface';

/**
 * Use: Unleash the fel energy stored within the crystal, sacrificing 24413 of your health to infuse
 * a target ally for 10 sec, absorbing 847500 damage. (1 Min, 30 Sec Cooldown)
 *
 * https://www.wowhead.com/item=250255/
 */

const COOLDOWN_SECONDS = 90;

interface TrinketUse {
  timestamp: number;
  targetID?: number;
  applied: number;
  absorb: number;
  expired: number;
  hasRemovalAmount: boolean;
  selfDamage: number;
}

export default class UnstableFelheartCrystal extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    combatants: Combatants,
  };

  protected abilities!: Abilities;
  protected combatants!: Combatants;
  protected uses: TrinketUse[] = [];
  protected totalAbsorb = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(ITEMS.UNSTABLE_FELHEART_CRYSTAL.id);
    if (!this.active) {
      return;
    }

    const { abilities } = options as Options & { abilities: Abilities };
    abilities.add({
      spell: SPELLS.UNSTABLE_FELHEART_CRYSTAL_DAMAGE.id,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: COOLDOWN_SECONDS,
      gcd: null,
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_FELHEART_CRYSTAL_DAMAGE),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_FELHEART_CRYSTAL_SHIELD),
      this.onApplyAbsorb,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_FELHEART_CRYSTAL_SHIELD),
      this.onApplyAbsorb,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_FELHEART_CRYSTAL_SHIELD),
      this.onAbsorb,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_FELHEART_CRYSTAL_SHIELD),
      this.onRemoveAbsorb,
    );
    // The health sacrifice is taken by the player who uses the trinket
    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_FELHEART_CRYSTAL_DAMAGE),
      this.onSelfDamage,
    );
  }

  private get currentUse(): TrinketUse | undefined {
    return this.uses[this.uses.length - 1];
  }

  private onCast(event: CastEvent) {
    this.uses.push({
      timestamp: event.timestamp,
      targetID: event.targetID,
      applied: 0,
      absorb: 0,
      expired: 0,
      hasRemovalAmount: false,
      selfDamage: 0,
    });
  }

  private onApplyAbsorb(event: ApplyBuffEvent | RefreshBuffEvent) {
    const use = this.currentUse;
    if (!use) {
      return;
    }
    use.targetID = event.targetID;
    const size = (event as { absorb?: number }).absorb;
    use.applied += size ?? 0;
  }

  private onAbsorb(event: AbsorbedEvent) {
    this.totalAbsorb += event.amount;
    const use = this.currentUse;
    if (use) {
      use.absorb += event.amount;
    }
  }

  private onRemoveAbsorb(event: RemoveBuffEvent) {
    const use = this.currentUse;
    if (!use) {
      return;
    }
    const leftover = (event as { absorb?: number }).absorb;
    if (typeof leftover === 'number') {
      use.expired += leftover;
      use.hasRemovalAmount = true;
    }
  }

  private onSelfDamage(event: DamageEvent) {
    const use = this.currentUse;
    if (!use) {
      return;
    }
    use.selfDamage += event.amount + (event.absorbed ?? 0);
  }

  private targetName(targetID?: number): string {
    if (targetID === undefined) {
      return 'Unknown';
    }
    return this.combatants.players[targetID]?.name ?? 'Unknown';
  }

  // Amount of absorb that could have prevented damage but did not
  private unusedAbsorb(use: TrinketUse) {
    if (use.hasRemovalAmount) {
      return use.expired;
    }
    // fallback when the removal event carries no leftover amount
    return Math.max(0, use.applied - use.absorb);
  }

  // Health lost by using the trinket
  private damageTaken(use: TrinketUse) {
    return use.selfDamage;
  }

  get totalCasts() {
    return this.uses.length;
  }

  get totalApplied() {
    return this.uses.reduce((sum, use) => sum + use.applied, 0);
  }

  get totalUnusedAbsorb() {
    return this.uses.reduce((sum, use) => sum + this.unusedAbsorb(use), 0);
  }

  get totalDamageTaken() {
    return this.uses.reduce((sum, use) => sum + this.damageTaken(use), 0);
  }

  get targetCount() {
    return new Set(this.uses.map((use) => use.targetID)).size;
  }

  get averageAbsorbPerUse() {
    return this.uses.length === 0 ? 0 : this.totalAbsorb / this.uses.length;
  }

  statistic() {
    const useRows = this.uses.map((use, index) => {
      const castTime = use.timestamp - this.owner.fight.start_time;
      return (
        <tr key={index}>
          <td>{formatDuration(castTime)}</td>
          <td>{this.targetName(use.targetID)}</td>
          <td>{formatNumber(use.applied)}</td>
          <td>{formatNumber(use.absorb)}</td>
          <td>{formatNumber(this.unusedAbsorb(use))}</td>
          <td>{formatNumber(this.damageTaken(use))}</td>
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
              Casts: <b>{this.totalCasts}</b>. Different targets: <b>{this.targetCount}</b>.
            </p>
            <p>
              Total absorb: <b>{formatNumber(this.totalAbsorb)}</b>. Not consumed:{' '}
              <b>{formatNumber(this.totalUnusedAbsorb)}</b>.
            </p>
            <p>
              Damage taken from using the trinket: <b>{formatNumber(this.totalDamageTaken)}</b>.
            </p>
            <p>
              Applied is the absorb size reported by the buff event, so it includes your own
              bonuses. Not consumed is the shield left when the absorb is removed (the same value
              WCL shows as overheal).
            </p>
          </>
        }
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Time</th>
                <th>Target</th>
                <th>Applied</th>
                <th>Absorbed</th>
                <th>Not consumed</th>
                <th>Damage taken</th>
              </tr>
            </thead>
            <tbody>{useRows}</tbody>
          </table>
        }
      >
        <BoringItemValueText item={ITEMS.UNSTABLE_FELHEART_CRYSTAL}>
          <div>
            <ItemHealingDone amount={this.totalAbsorb} />
          </div>
          <div>
            <SpellIcon spell={SPELLS.UNSTABLE_FELHEART_CRYSTAL_SHIELD} />{' '}
            {formatNumber(this.averageAbsorbPerUse)} <small>average absorb per use</small>
          </div>
          <div>
            {formatNumber(this.totalUnusedAbsorb)} <small>absorb not consumed</small>
          </div>
          <div>
            {formatNumber(this.totalDamageTaken)} <small>damage taken from use</small>
          </div>
        </BoringItemValueText>
      </Statistic>
    );
  }
}
