import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  HealEvent,
  ResourceChangeEvent,
  SpendResourceEvent,
  SummonEvent,
} from 'parser/core/Events';
import { isPermanentPet } from 'parser/shared/modules/pets/helpers';

import { SUMMON_TO_SPELL_MAP } from '../CONSTANTS';
import { isWildImp } from '../helpers';
import PETS from '../PETS';
import { TimelinePet } from '../TimelinePet';
import DemoPets from './index';

const debug = false;
const test = false;
const DEMONIC_POWER_DURATION = 15000;
const BUFFER = 150;
type PlayerPositionEvent = CastEvent | DamageEvent | ResourceChangeEvent | HealEvent;

class PetSummonHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;

  _lastDemonicTyrantCast: number | null = null;
  _lastIDtick: number | null = null;
  _lastSpendResource: number | null = null;
  _lastPlayerPosition = {
    x: 0,
    y: 0,
  };

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.onEnergize);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHealTaken);
    // this.addEventListener(Events.absorbed.to(SELECTED_PLAYER), this.onAbsorb);
  }

  onSummon(event: SummonEvent) {
    const petInfo = this.demoPets._getPetInfo(event.targetID);
    if (!petInfo) {
      debug && this.error('Summoned unknown pet', event);
      return;
    }
    if (isPermanentPet(petInfo.guid)) {
      test && this.log('Permanent pet summon');
      this.demoPets.timeline.tryDespawnLastPermanentPet(event.timestamp);
    }
    const pet = new TimelinePet(
      petInfo,
      event.targetID,
      event.targetInstance,
      event.timestamp,
      this._getPetDuration(event.targetID),
      event.ability.guid,
      this._getSummonSpellId(event),
    );
    if (isWildImp(pet.guid)) {
      // Wild Imps need few additional properties
      pet.setWildImpProperties(this._lastPlayerPosition);
    }
    test && this.log('Pet summoned', pet);
    this.demoPets.timeline.addPet(pet);
    pet.pushHistory(event.timestamp, 'Summoned', event);
    if (pet.summonedBy === TALENTS.INNER_DEMONS_TALENT.id) {
      this._lastIDtick = event.timestamp;
    }
  }

  onCast(event: CastEvent) {
    this._updatePlayerPosition(event);
    if (event.ability.guid !== SPELLS.SUMMON_DEMONIC_TYRANT.id) {
      return;
    }
    this._lastDemonicTyrantCast = event.timestamp;
  }

  onSpendResource(event: SpendResourceEvent) {
    this._lastSpendResource = event.timestamp;
  }

  // to update player position more accurately (based on DistanceMoved)
  // important, since Wild Imp summons uses player position as default (not entirely accurate, as they're spawned around player, not exactly on top of it, but that's as close as I'm gonna get)
  // needed for Implosion - there's a possibility that Wild Imps don't cast anything between their 'summon' and Implosion, therefore I wouldn't get their position

  onDamageTaken(event: DamageEvent) {
    this._updatePlayerPosition(event);
  }

  onEnergize(event: ResourceChangeEvent) {
    this._updatePlayerPosition(event);
  }

  onHealTaken(event: HealEvent) {
    this._updatePlayerPosition(event);
  }

  // onAbsorb(event: AbsorbedEvent) {
  //   this._updatePlayerPosition(event);
  // }

  _getPetDuration(id: number, isGuid = false) {
    const pet = this.demoPets._getPetInfo(id, isGuid);
    if (!pet) {
      debug &&
        this.error(
          `NewPets._getPetDuration() called with nonexistant pet ${isGuid ? 'gu' : ''}id ${id}`,
        );
      return -1;
    }
    if (isPermanentPet(pet.guid)) {
      debug && this.log('Called _getPetDuration() for permanent pet guid', pet);
      return Infinity;
    }
    if (!PETS[pet.guid]) {
      debug && this.error('Encountered pet unknown to PET_INFO.js', pet);
      return -1;
    }
    // for imps, take Demonic Tyrant in consideration
    // if player doesn't have the buff, it's 15 seconds
    if (
      isWildImp(pet.guid) &&
      this.selectedCombatant.hasBuff(SPELLS.DEMONIC_POWER.id) &&
      this._lastDemonicTyrantCast
    ) {
      // if player has the buff, it takes the remaining buff time + 15 seconds
      const remainingBuffTime =
        this._lastDemonicTyrantCast + DEMONIC_POWER_DURATION - this.owner.currentTimestamp;
      return PETS[pet.guid].duration + remainingBuffTime;
    }
    return PETS[pet.guid].duration;
  }

  _getSummonSpellId(event: SummonEvent): number {
    if (!SUMMON_TO_SPELL_MAP[event.ability.guid]) {
      if (this._lastIDtick && event.timestamp <= this._lastIDtick + BUFFER) {
        return TALENTS.INNER_DEMONS_TALENT.id;
      }

      debug && this.error('Unknown source of summon event', event);
      return -1;
    }
    return SUMMON_TO_SPELL_MAP[event.ability.guid];
  }

  _updatePlayerPosition(event: PlayerPositionEvent) {
    if (!event.x || !event.y) {
      return;
    }
    this._lastPlayerPosition.x = event.x;
    this._lastPlayerPosition.y = event.y;
  }
}

export default PetSummonHandler;
