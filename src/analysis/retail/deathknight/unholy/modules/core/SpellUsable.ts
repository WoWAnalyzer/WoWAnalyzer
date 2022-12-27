import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/deathknight';
import SPELLS from 'common/SPELLS';

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
    this.hasAotd = this.selectedCombatant.hasTalent(TALENTS.ARMY_OF_THE_DAMNED_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.APOCALYPSE_TALENT),
      this.onApocalypseCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.MELEE),
      this.onArmyDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.IMPROVED_DEATH_COIL_TALENT),
      this.onDeathCoilCast,
    );
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

    if (!this.isOnCooldown(TALENTS.ARMY_OF_THE_DEAD_TALENT.id)) {
      this.beginCooldown(event, TALENTS.ARMY_OF_THE_DEAD_TALENT.id);
    }
  }

  onDeathCoilCast(event: CastEvent) {
    if (this.isOnCooldown(TALENTS.DARK_TRANSFORMATION_TALENT.id)) {
      this.reduceCooldown(
        TALENTS.DARK_TRANSFORMATION_TALENT.id,
        DEATH_COIL_RANK_2_REDUCTION,
        event.timestamp,
      );
    }
  }
}

export default SpellUsable;
