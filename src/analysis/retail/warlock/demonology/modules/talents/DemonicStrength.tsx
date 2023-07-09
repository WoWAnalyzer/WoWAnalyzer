import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import Pets from 'parser/shared/modules/Pets';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import PETS from '../pets/PETS';

const BUFFER = 200;

class DemonicStrength extends Analyzer {
  static dependencies = {
    pets: Pets,
  };

  pets!: Pets;
  _removedAt: number | null = null;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEMONIC_STRENGTH_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.FELSTORM_DAMAGE),
      this.handleFelstormDamage,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.DEMONIC_STRENGTH_TALENT),
      this.handleRemoveDemonicStrength,
    );
  }

  handleFelstormDamage(event: DamageEvent) {
    // pet ability Felstorm and this "empowered" Felstorm can't be active at the same time, they're exclusive (the game doesn't let you cast it)
    const petInfo = this.owner.playerPets.find((pet) => pet.id === event.sourceID);
    if (petInfo?.guid === PETS.GRIMOIRE_FELGUARD.guid) {
      // Grimoire: Felguard uses same spell IDs
      return;
    }
    const pet = this.pets.getSourceEntity(event);
    if (
      pet?.hasBuff(TALENTS.DEMONIC_STRENGTH_TALENT.id) ||
      (this._removedAt && event.timestamp <= this._removedAt + BUFFER)
    ) {
      // the last empowered Felstorm usually happens in this order:
      // Felstorm cast -> Demonic Strength removebuff -> Felstorm damages
      // So in order to also count the last empowered damage events, we also count damage events within 200ms of the removebuff
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  handleRemoveDemonicStrength(event: RemoveBuffEvent) {
    this._removedAt = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spell={TALENTS.DEMONIC_STRENGTH_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DemonicStrength;
