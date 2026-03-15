import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, RemoveDebuffEvent, DeathEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

export interface UACastData {
  cast: CastEvent;
  wasted?: boolean;
  stacksOnTarget: number;
}

class UnstableAfflictionCasts extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  casts: UACastData[] = [];
  private castsByTarget = new Map<string, UACastData[]>();

  constructor(options: Options) {
    super(options);

    // Bind all handlers explicitly
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_AFFLICTION),
      this.onUACast.bind(this),
    );

    this.addEventListener(
      Events.removedebuff.spell(SPELLS.UNSTABLE_AFFLICTION),
      this.onRemoveDebuff.bind(this),
    );

    this.addEventListener(Events.death, this.onDeath.bind(this));
    this.addEventListener(Events.fightend, this.onFightEnd.bind(this));
  }

  onUACast(event: CastEvent) {
    const target = this.enemies.getEntity(event);
    if (!target) return;

    const targetKey = encodeEventTargetString(event);
    if (!targetKey) return; // skip casts with no valid target ie cancelled casts

    const debuff = target.getBuff(SPELLS.UNSTABLE_AFFLICTION.id, event.timestamp);
    const currentStacks = debuff?.stacks || 0;

    const castData: UACastData = { cast: event, wasted: false, stacksOnTarget: currentStacks };

    const arr = this.castsByTarget.get(targetKey) ?? [];
    arr.push(castData);
    this.castsByTarget.set(targetKey, arr);
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    const targetKey = encodeEventTargetString(event);
    const castsForTarget = this.castsByTarget.get(targetKey);
    if (!castsForTarget || castsForTarget.length === 0) return;

    for (const castData of castsForTarget) {
      castData.wasted = true;
      this.casts.push(castData);
    }

    this.castsByTarget.set(targetKey, []);
  }

  onDeath(event: DeathEvent) {
    const targetKey = encodeEventTargetString(event);
    const castsForTarget = this.castsByTarget.get(targetKey);
    if (!castsForTarget) return;

    for (const castData of castsForTarget) {
      castData.wasted = false;
      this.casts.push(castData);
    }

    this.castsByTarget.set(targetKey, []);
  }

  onFightEnd() {
    for (const [, casts] of this.castsByTarget) {
      for (const castData of casts) {
        castData.wasted = false;
        this.casts.push(castData);
      }
    }
    this.castsByTarget.clear();
  }

  get castEfficiency(): number {
    if (this.casts.length === 0) return 0;
    const effectiveCasts = this.casts.filter((c) => !c.wasted).length;
    return effectiveCasts / this.casts.length;
  }
}

export default UnstableAfflictionCasts;
