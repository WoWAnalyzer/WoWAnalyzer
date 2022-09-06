import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { BuffEvent, DamageEvent, HealEvent } from 'parser/core/Events';

export const KOTH_BUFF = { id: 366794 };
export const KOTH_HEAL = { id: 366793 };

type Hp = {
  current: number;
  max: number;
};

type KothUpdate = {
  old: Hp;
  new: Hp;
  event: BuffEvent<any>;
};

function hpFromEvent(event: DamageEvent | HealEvent): Hp | null {
  if (event.hitPoints === undefined || event.maxHitPoints === undefined) {
    return null;
  }

  return {
    current: event.hitPoints + (event.type === 'damage' ? event.amount : -event.amount),
    max: event.maxHitPoints,
  };
}

const debug = false;

export default class KegOfTheHeavens extends Analyzer {
  private actualHealingDone = 0;

  private kothUpdates: KothUpdate[];
  private pendingKothUpdate: Partial<KothUpdate>;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(KOTH_BUFF), this.kothUpdate);

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(KOTH_BUFF),
      this.kothUpdate,
    );

    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(KOTH_BUFF), this.kothUpdate);

    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(KOTH_BUFF), this.kothUpdate);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(KOTH_HEAL), this.kothHeal);

    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.updateHealth);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.updateHealth);

    this.addEventListener(Events.fightend, this.finalize);

    this.pendingKothUpdate = {};
    this.kothUpdates = [];
  }

  private storeKothUpdate() {
    this.kothUpdates.push(this.pendingKothUpdate as KothUpdate);
    ((this.pendingKothUpdate.event! as unknown) as any).__koth = this.pendingKothUpdate;
    this.pendingKothUpdate = {};
  }

  private updateHealth(event: DamageEvent | HealEvent) {
    if (event.hitPoints === undefined || event.maxHitPoints === undefined) {
      return;
    }

    if (this.pendingKothUpdate.event && this.pendingKothUpdate.old) {
      // we have a koth buff event, time to record hp values.
      if (this.pendingKothUpdate.new?.max === this.pendingKothUpdate.old.max) {
        // max update sometimes takes a 2nd event to update. allow for that.
        this.pendingKothUpdate.new.max = event.maxHitPoints ?? this.pendingKothUpdate.new.max;
        this.storeKothUpdate();
      } else {
        this.pendingKothUpdate.new = hpFromEvent(event)!;

        if (event.maxHitPoints !== this.pendingKothUpdate.old.max) {
          // max hp update has already propagated. storing
          this.storeKothUpdate();
        }
      }
    } else {
      this.pendingKothUpdate.old = hpFromEvent(event)!;
    }
  }

  private kothUpdate(event: BuffEvent<any>) {
    if (this.pendingKothUpdate.event && this.pendingKothUpdate.new) {
      // deal with the case where we wait for a 2nd hp update to verify max hp
      // changes, but it doesn't happen before the next KotH.
      this.storeKothUpdate();
    }
    this.pendingKothUpdate.event = event;
  }

  private kothHeal(event: HealEvent) {
    this.actualHealingDone += event.amount + (event.absorbed || 0) + (event.overheal || 0);
  }

  get healingDone() {
    return this.actualHealingDone;
  }

  get netPhantomHealing() {
    return this.kothUpdates
      .map(({ old, new: new_ }) => new_.current - old.current)
      .reduce((a, b) => a + b, 0);
  }

  private finalize() {
    if (this.pendingKothUpdate.new) {
      this.storeKothUpdate();
    }

    debug && console.log('KotH', this.kothUpdates, this.healingDone, this.netPhantomHealing);
  }
}
