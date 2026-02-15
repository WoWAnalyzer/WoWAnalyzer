import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DeathEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';

const TRIGGER_SPELLS = [
  SPELLS.INVOKE_XUEN_BUFF,
  TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
  TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
];
const END_SPELLS = [SPELLS.INVOKE_YULON_BUFF, SPELLS.INVOKE_XUEN_BUFF];
class CelestialHooks extends Analyzer {
  celestialActive = false;
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(TRIGGER_SPELLS), this.summon);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.end);
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.end);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(END_SPELLS), this.end);
  }

  summon(event: CastEvent) {
    this.celestialActive = true;
  }

  end(event: DeathEvent | RemoveBuffEvent) {
    this.celestialActive = false;
  }
}

export default CelestialHooks;
