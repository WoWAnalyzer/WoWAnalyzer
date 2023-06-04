import spells from 'common/SPELLS/shaman';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Haste from 'parser/shared/modules/Haste';

const noGCDSpellIds = [spells.LIGHTNING_BOLT.id, TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id];

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  protected haste!: Haste;

  onCast(event: CastEvent): void {
    if (
      noGCDSpellIds.includes(event.ability.guid) &&
      this.isOnGlobalCooldown(spells.WINDSTRIKE_CAST.id)
    ) {
      return;
    }

    super.onCast(event);
  }
}

export default GlobalCooldown;
