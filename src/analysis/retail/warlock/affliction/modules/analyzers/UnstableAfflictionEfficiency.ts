import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, RemoveDebuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

export interface UACastData {
  cast: CastEvent;
  wasted?: boolean; // if it overcapped or fell off
  stacksOnTarget: number;
}

class UnstableAfflictionCasts extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  casts: UACastData[] = [];

  constructor(options: Options) {
    super(options);
    // Track UA casts
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UNSTABLE_AFFLICTION),
      (event) => this.onUACast(event),
    );

    // Track UA falling off
    this.addEventListener(
      Events.removedebuff.spell(SPELLS.UNSTABLE_AFFLICTION),
      (event: RemoveDebuffEvent) => this.onRemoveDebuff(event),
    );
  }

  private onUACast(event: CastEvent) {
    const target = this.enemies.getEntity(event);
    let currentStacks = 0;

    if (target) {
      const debuff = target.getBuff(SPELLS.UNSTABLE_AFFLICTION.id, event.timestamp);
      if (debuff) {
        currentStacks = debuff.stacks || 0;
      }
    }

    this.casts.push({
      cast: event,
      wasted: false,
      stacksOnTarget: currentStacks,
    });
  }

  private onRemoveDebuff(event: RemoveDebuffEvent) {
    const targetID = event.targetID;

    // Find the last cast on this target that wasn't wasted
    const lastCast = [...this.casts]
      .reverse()
      .find((c) => c.cast.targetID === targetID && !c.wasted);

    if (lastCast) {
      lastCast.wasted = true;
    }
  }
  get castEfficiency(): number {
    if (this.casts.length === 0) return 0;
    const effectiveCasts = this.casts.filter((c) => !c.wasted).length;
    return effectiveCasts / this.casts.length;
  }
}

export default UnstableAfflictionCasts;
