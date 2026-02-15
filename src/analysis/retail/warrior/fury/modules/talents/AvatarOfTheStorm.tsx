import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const THUNDER_CLAP_IDS = [SPELLS.THUNDER_CLAP.id, SPELLS.THUNDER_BLAST.id];
const STORM_SURGE_CDR_MULTIPLIER = 2;

class AvatarOfTheStorm extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;
  hasAvatarOfTheStorm = false;
  hasStormSurge = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AVATAR_TALENT);
    if (!this.active) {
      return;
    }
    this.hasAvatarOfTheStorm = this.selectedCombatant.hasTalent(TALENTS.AVATAR_OF_THE_STORM_TALENT);
    this.hasStormSurge = this.selectedCombatant.hasTalent(TALENTS.STORM_SURGE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_SHARED),
      this.onAvatarCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_SHARED),
      this.onAvatarRemove,
    );
  }

  // With avatar of the storm, casting avatar resets thunder clap cd
  // and with storm surge, thunder clap cd is halved during avatar
  onAvatarCast(event: CastEvent) {
    if (this.hasAvatarOfTheStorm) {
      this.spellUsable.endCooldown(SPELLS.THUNDER_CLAP.id);
      this.spellUsable.endCooldown(SPELLS.THUNDER_BLAST.id);
    }
    if (this.hasStormSurge) {
      this.spellUsable.applyCooldownRateChange(THUNDER_CLAP_IDS, STORM_SURGE_CDR_MULTIPLIER);
    }
  }

  onAvatarRemove(event: RemoveBuffEvent) {
    if (this.hasStormSurge) {
      this.spellUsable.removeCooldownRateChange(THUNDER_CLAP_IDS, STORM_SURGE_CDR_MULTIPLIER);
    }
  }
}

export default AvatarOfTheStorm;
