import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginChannelEvent, EndChannelEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Haste from 'parser/shared/modules/Haste';

class CelestialConduit extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  damage: number = 0;
  healing: number = 0;
  cancelledCasts: number = 0;
  channelStart: number = 0;
  channelEnd: number = 0;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT) &&
      this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;

    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT),
      this.onChannelStart,
    );
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT),
      this.onChannelEnd,
    );
  }

  private onChannelStart(event: BeginChannelEvent) {}

  private onChannelEnd(event: EndChannelEvent) {}
  //gonna use this module to add to the cooldown section of the guid
}

export default CelestialConduit;
