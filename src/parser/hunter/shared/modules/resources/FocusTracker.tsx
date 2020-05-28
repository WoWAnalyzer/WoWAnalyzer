import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import { EnergizeEvent } from 'parser/core/Events';

const BARBED_SHOT_SPELLS = [SPELLS.BARBED_SHOT_BUFF.id, SPELLS.BARBED_SHOT_BUFF_STACK_2.id, SPELLS.BARBED_SHOT_BUFF_STACK_3.id, SPELLS.BARBED_SHOT_BUFF_STACK_4.id, SPELLS.BARBED_SHOT_BUFF_STACK_5.id, SPELLS.BARBED_SHOT_BUFF_STACK_6.id, SPELLS.BARBED_SHOT_BUFF_STACK_7, SPELLS.BARBED_SHOT_BUFF_STACK_8];
const SPELLS_WITHOUT_WASTE = [SPELLS.ASPECT_OF_THE_WILD.id, SPELLS.CHIMAERA_SHOT_FOCUS.id, ...BARBED_SHOT_SPELLS];
let BARBED_SHOT_REGEN = 5;
const AOTW_REGEN = 5;
const CHIM_REGEN = 10;

class FocusTracker extends ResourceTracker {
  constructor(options: any) {
    super(options);
    this.resource = RESOURCE_TYPES.FOCUS;
    if (this.selectedCombatant.hasTalent(SPELLS.SCENT_OF_BLOOD_TALENT.id)) {
      BARBED_SHOT_REGEN += 2;
    }
  }

  //Because energize events associated with certain spells don't provide a waste number, but instead a lower resourceChange number we can calculate the waste ourselves.
  on_toPlayer_energize(event: EnergizeEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const spellId = event.ability.guid;
    let waste;
    let gain;
    if (SPELLS_WITHOUT_WASTE.includes(spellId)) {
      gain = event.resourceChange;
      if (BARBED_SHOT_SPELLS.includes(spellId)) {
        waste = BARBED_SHOT_REGEN - event.resourceChange;
      } else if (spellId === SPELLS.ASPECT_OF_THE_WILD.id) {
        waste = AOTW_REGEN - event.resourceChange;
      } else if (spellId === SPELLS.CHIMAERA_SHOT_FOCUS.id) {
        waste = CHIM_REGEN - event.resourceChange;
      }
    } else {
      waste = event.waste;
      gain = event.resourceChange - waste;
    }

    this._applyBuilder(spellId, this.getResource(event), gain, waste, event.timestamp);
  }
}

export default FocusTracker;
