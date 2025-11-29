import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import EarthlivingTracker from './EarthlivingTracker';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import {
  HEALING_WAVE,
  CHAIN_HEAL,
  HEALING_STREAM_TOTEM_HEAL,
  HEALING_TIDE_TOTEM_HEAL,
  STORMSTREAM_TOTEM_HEAL,
  RIPTIDE,
} from '../../constants';
import HotTracker from 'parser/shared/modules/HotTracker';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { earthlivingApplication } from '../../normalizers/CastLinkNormalizer';
import UnleashLife from '../talents/UnleashLife';

class EarthlivingAttributor extends Analyzer {
  static dependencies = {
    earthlivingTracker: EarthlivingTracker,
    combatants: Combatants,
    unleashLife: UnleashLife,
  };

  protected unleashLife!: UnleashLife;
  protected combatants!: Combatants;
  protected earthlivingTracker!: EarthlivingTracker;

  healingWaveAttrib = HotTracker.getNewAttribution(HEALING_WAVE);
  chainHealAttrib = HotTracker.getNewAttribution(CHAIN_HEAL);
  riptideAttrib = HotTracker.getNewAttribution(RIPTIDE);
  healingStreamTotemHealAttrib = HotTracker.getNewAttribution(HEALING_STREAM_TOTEM_HEAL);
  healingTideTotemHealAttrib = HotTracker.getNewAttribution(HEALING_TIDE_TOTEM_HEAL);
  stormstreamTotemHealAttrib = HotTracker.getNewAttribution(STORMSTREAM_TOTEM_HEAL);
  undefinedAttrib = HotTracker.getNewAttribution('Undefined');

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EARTHLIVING_WEAPON_HEAL),
      this.onApplyEarthliving,
    );
  }

  onApplyEarthliving(event: ApplyBuffEvent | RefreshBuffEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (
      !this.earthlivingTracker.hots[targetID] ||
      !this.earthlivingTracker.hots[targetID][spellID]
    ) {
      return;
    }

    const applicationEvent = earthlivingApplication(event);
    if (typeof applicationEvent !== 'undefined') {
      switch (applicationEvent.ability.guid) {
        case SPELLS.HEALING_WAVE.id: {
          this.earthlivingTracker.addAttributionFromApply(this.healingWaveAttrib, event);
          break;
        }
        case TALENTS.CHAIN_HEAL_TALENT.id: {
          this.earthlivingTracker.addAttributionFromApply(this.chainHealAttrib, event);
          break;
        }
        case TALENTS.RIPTIDE_TALENT.id: {
          this.earthlivingTracker.addAttributionFromApply(this.riptideAttrib, event);
          break;
        }
        case SPELLS.HEALING_STREAM_TOTEM_HEAL.id: {
          this.earthlivingTracker.addAttributionFromApply(this.healingStreamTotemHealAttrib, event);
          break;
        }
        case SPELLS.HEALING_TIDE_TOTEM_HEAL.id: {
          this.earthlivingTracker.addAttributionFromApply(this.healingTideTotemHealAttrib, event);
          break;
        }
        case SPELLS.STORMSTREAM_TOTEM_HEAL.id: {
          this.earthlivingTracker.addAttributionFromApply(this.stormstreamTotemHealAttrib, event);
          break;
        }
      }
    } else {
      //TODO: Figure out why these events are happening
      this.earthlivingTracker.addAttributionFromApply(this.undefinedAttrib, event);
    }
  }
}

export default EarthlivingAttributor;
