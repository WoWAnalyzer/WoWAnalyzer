import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import Events, { SpendResourceEvent } from 'parser/core/Events';
import { SpellUsable } from 'analysis/retail/evoker/shared';

abstract class Tempest extends Analyzer {
  static dependencies = {
    resourceTracker: ResourceTracker,
    spellUsable: SpellUsable,
  };

  protected resourceTracker!: ResourceTracker;
  protected spellUsable!: SpellUsable;
  protected enabledAfterMaelstromSpent: number;
  protected wastedProcs: number = 0;

  private current: number = 0;

  protected constructor(enabledAfterMaelstromSpent: number, options: Options) {
    super(options);
    this.enabledAfterMaelstromSpent = enabledAfterMaelstromSpent;
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendMaelstrom);
  }

  private onSpendMaelstrom(event: SpendResourceEvent) {
    if (event.resourceChangeType !== this.resourceTracker.resource.id) {
      return;
    }

    this.current += event.resourceChangeType;
    if (this.current >= this.enabledAfterMaelstromSpent) {
      this.current -= this.enabledAfterMaelstromSpent;
    }
  }
}

export default Tempest;
