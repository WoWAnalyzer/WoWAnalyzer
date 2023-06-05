import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Haste from 'parser/shared/modules/Haste';

const noGCDSpellIds = [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id];

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  protected haste!: Haste;

  onCast(event: CastEvent): void {
    if (
      noGCDSpellIds.includes(event.ability.guid) &&
      this.isOnGlobalCooldown(SPELLS.WINDSTRIKE_CAST.id)
    ) {
      return;
    }

    super.onCast(event);
  }
}

export default GlobalCooldown;
