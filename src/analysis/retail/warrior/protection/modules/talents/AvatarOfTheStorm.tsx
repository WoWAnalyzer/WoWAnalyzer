import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const STORM_SURGE_CDR_MULTIPLIER = 2;

class AvatarOfTheStorm extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private hasAvatarOfTheStorm = false;
  private hasStormSurge = false;
  private hasThunderBlast = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AVATAR_TALENT);

    if (!this.active) {
      return;
    }

    this.hasAvatarOfTheStorm = this.selectedCombatant.hasTalent(TALENTS.AVATAR_OF_THE_STORM_TALENT);
    this.hasStormSurge = this.selectedCombatant.hasTalent(TALENTS.STORM_SURGE_TALENT);
    this.hasThunderBlast = this.selectedCombatant.hasTalent(TALENTS.THUNDER_BLAST_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_SHARED),
      this.onAvatarApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_SHARED),
      this.onAvatarRemove,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_BLAST_BUFF),
      this.onThunderBlastAvailable,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_BLAST_BUFF),
      this.onThunderBlastAvailable,
    );
  }

  private onAvatarApply(event: ApplyBuffEvent) {
    // Avatar of the Storm immediately resets Thunder Clap/Blast
    if (this.hasAvatarOfTheStorm) {
      this.spellUsable.endCooldown(SPELLS.THUNDER_CLAP.id, event.timestamp);
    }

    // Storm Surge doubles Thunder Clap's cooldown recovery rate while Avatar is active
    if (this.hasStormSurge) {
      this.spellUsable.applyCooldownRateChange(
        SPELLS.THUNDER_CLAP.id,
        STORM_SURGE_CDR_MULTIPLIER,
        event.timestamp,
      );
    }
  }

  private onAvatarRemove(event: RemoveBuffEvent) {
    // Remove the temporary Storm Surge recovery-rate multiplier when Avatar ends
    if (this.hasStormSurge) {
      this.spellUsable.removeCooldownRateChange(
        SPELLS.THUNDER_CLAP.id,
        STORM_SURGE_CDR_MULTIPLIER,
        event.timestamp,
      );
    }
  }

  private onThunderBlastAvailable(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    // Thunder Blast stacks make Thunder Clap immediately castable
    if (this.hasThunderBlast) {
      this.spellUsable.endCooldown(SPELLS.THUNDER_CLAP.id, event.timestamp);
    }
  }
}

export default AvatarOfTheStorm;
