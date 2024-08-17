import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import Events, { RefreshBuffEvent, SpendResourceEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import typedKeys from 'common/typedKeys';

enum WastedProcType {
  AwakeningStorms,
  SpendMaelstrom,
}

abstract class Tempest extends Analyzer {
  static dependencies = {
    resourceTracker: ResourceTracker,
    spellUsable: SpellUsable,
  };

  protected resourceTracker!: ResourceTracker;
  protected spellUsable!: SpellUsable;
  protected enabledAfterMaelstromSpent: number;

  protected wastedProcs: { [key: number]: number } = {
    [WastedProcType.AwakeningStorms]: 0,
    [WastedProcType.SpendMaelstrom]: 0,
  };

  private current: number = 0;
  private awakeningStormsStacks: number = 0;
  private nextTempestIsFromAwakeningStorms: boolean = false;

  protected constructor(enabledAfterMaelstromSpent: number, options: Options) {
    super(options);
    this.enabledAfterMaelstromSpent = enabledAfterMaelstromSpent;

    this.active = this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendMaelstrom);
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.AWAKENING_STORMS_BUFF),
      () => (this.awakeningStormsStacks = 1),
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.AWAKENING_STORMS_BUFF),
      () => (this.awakeningStormsStacks += 1),
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AWAKENING_STORMS_BUFF),
      () => {
        this.awakeningStormsStacks = 0;
        this.nextTempestIsFromAwakeningStorms = true;
      },
    );
  }

  onRefresh(event: RefreshBuffEvent) {
    this.wastedProcs[Number(this.nextTempestIsFromAwakeningStorms)] += 1;
    this.nextTempestIsFromAwakeningStorms = false;
  }

  onSpendMaelstrom(event: SpendResourceEvent) {
    if (event.resourceChangeType !== this.resourceTracker.resource.id) {
      return;
    }
    this.current += event.resourceChangeType;
    if (this.current >= this.enabledAfterMaelstromSpent) {
      this.current -= this.enabledAfterMaelstromSpent;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL()}
        tooltip={
          <>
            {this.wastedProcs[WastedProcType.SpendMaelstrom]} wasted proc(s) from spending maelstrom
            <br />
            {this.wastedProcs[WastedProcType.AwakeningStorms]} wasted proc(s) from{' '}
            <SpellLink spell={TALENTS.AWAKENING_STORMS_TALENT} />
          </>
        }
      >
        <TalentSpellText talent={TALENTS.TEMPEST_TALENT}>
          <div>
            {typedKeys(this.wastedProcs).reduce((total, k) => this.wastedProcs[k] + total, 0)}{' '}
            wasted casts
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Tempest;
