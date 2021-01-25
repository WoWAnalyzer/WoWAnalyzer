import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';

const AOTD_PET_ID = 365;
const DEATH_COIL_RANK_2_REDUCTION = 1000;


class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  hasAotd: boolean;
  apocalypseUsed = false;

  constructor(options: Options) {
    super(options);
    this.hasAotd = this.selectedCombatant.hasTalent(SPELLS.ARMY_OF_THE_DAMNED_TALENT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.APOCALYPSE), this.onApocalypseCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.MELEE), this.onArmyDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATH_COIL), this.onDeathCoilCast);
  }

  onApocalypseCast(event: CastEvent) {
    if (!this.apocalypseUsed) {
      this.apocalypseUsed = true;
    }
  }

  onArmyDamage(event: DamageEvent) {
    if (event.sourceID !== AOTD_PET_ID || this.apocalypseUsed) {
      return;
    }

    if (!this.isOnCooldown(SPELLS.ARMY_OF_THE_DEAD.id)) {
      this.beginCooldown(SPELLS.ARMY_OF_THE_DEAD.id, event);
    }
  }
  
  onDeathCoilCast(event: CastEvent) {
    if (this.isOnCooldown(SPELLS.DARK_TRANSFORMATION.id)) {
      this.reduceCooldown(SPELLS.DARK_TRANSFORMATION.id, DEATH_COIL_RANK_2_REDUCTION, event.timestamp);
    }
  }

}

export default SpellUsable;
