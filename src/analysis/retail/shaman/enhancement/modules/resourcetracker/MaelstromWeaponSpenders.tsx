import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MaelstromWeaponTracker from './MaelstromWeaponTracker';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import Panel from 'parser/ui/Panel';
import { MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from '../../constants';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';

export default class extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  protected maelstromWeaponTracker!: MaelstromWeaponTracker;
  protected spenderValues: Record<number, number> = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onSpender,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onSpender,
    );
  }

  onSpender(event: DamageEvent | HealEvent) {
    this.spenderValues[event.ability.guid] ??= 0;
    this.spenderValues[event.ability.guid] += event.amount;
  }

  statistic() {
    return [
      <Panel key="Panel" title="Maelstrom Weapon usage" pad={false} position={120}>
        <ResourceBreakdown tracker={this.maelstromWeaponTracker} showSpenders showMaxSpenders />
      </Panel>,
    ];
  }
}
