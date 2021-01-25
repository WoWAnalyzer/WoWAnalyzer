import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';

import DemoPets from './index';
import { DESPAWN_REASONS, META_CLASSES, META_TOOLTIPS } from '../TimelinePet';
import { isWildImp } from '../helpers';

const debug = false;
const test = false;

class PowerSiphonHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.POWER_SIPHON_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_SIPHON_TALENT), this.onPowerSiphonCast);
  }

  onPowerSiphonCast(event) {
    if (!event.activeImpsAfterCast || event.activeImpsAfterCast.length === 0) {
      debug && this.error('Power Siphon cast didn\'t have any active imps after cast', event);
    }
    // gets current imps that aren't "scheduled for implosion"
    // filters out only those that aren't active after the cast (they can't be killed because they're casting in the future)
    const currentImps = this.demoPets.currentPets
      .filter(pet => isWildImp(pet.guid) && !pet.shouldImplode)
      .sort((imp1, imp2) => (imp1.currentEnergy - imp2.currentEnergy) || (imp1.spawn - imp2.spawn));
    const filtered = currentImps
      .filter(imp => !event.activeImpsAfterCast.includes(encodeTargetString(imp.id, imp.instance)));
    test && this.log('POWER SIPHON cast', event.timestamp, ', current imps, sorted', JSON.parse(JSON.stringify(currentImps)));
    test && this.log('Imps that AREN\'T active after PS cast, sorted', JSON.parse(JSON.stringify(filtered)));
    // doesn't really make sense - sometimes you have loads of imps to sacrifice, but it doesn't pick them (because they're active after the cast)
    if (filtered.length === 0) {
      // game won't let you cast Power Siphon without available Wild Imps, if cast went through and we don't have Imps, we've done something wrong
      debug && this.error('Something wrong, no Imps found on Power Siphon cast');
      return;
    }
    // kill up to 2 imps
    filtered.slice(0, 2).forEach(imp => {
      imp.despawn(event.timestamp, DESPAWN_REASONS.POWER_SIPHON);
      imp.setMeta(META_CLASSES.DESTROYED, META_TOOLTIPS.POWER_SIPHON);
      imp.pushHistory(event.timestamp, 'Killed by Power Siphon', event);
      test && this.log(`Despawning imp`, imp);
    });
  }
}

export default PowerSiphonHandler;
