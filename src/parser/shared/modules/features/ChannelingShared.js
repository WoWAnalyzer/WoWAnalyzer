import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';

class ChannelingShared extends CoreChanneling {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.CYCLOTRONIC_BLAST.id || SPELLS.LATENT_ARCANA_CHANNEL.id) {
      return;
    }
    super.on_byPlayer_cast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.CYCLOTRONIC_BLAST.id || SPELLS.LATENT_ARCANA_CHANNEL.id)) {
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.CYCLOTRONIC_BLAST.id) {
      return;
    }
    this.beginChannel(event);
  }

  on_byPlayer_removedebuff(event) {
    if (event.ability.guid !== SPELLS.CYCLOTRONIC_BLAST.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.CYCLOTRONIC_BLAST.id)) {
      return;
    }
    this.endChannel(event);
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.LATENT_ARCANA_CHANNEL.id) {
      return;
    }
    this.beginChannel(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.LATENT_ARCANA_CHANNEL.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.LATENT_ARCANA_CHANNEL.id)) {
      return;
    }
    this.endChannel(event);
  }

}

export default ChannelingShared;
