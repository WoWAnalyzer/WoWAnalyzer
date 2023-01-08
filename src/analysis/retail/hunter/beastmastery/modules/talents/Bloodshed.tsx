import { BLOODSHED_DAMAGE_AMP } from 'analysis/retail/hunter/beastmastery/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Enemies from 'parser/shared/modules/Enemies';
import { isPermanentPet } from 'parser/shared/modules/pets/helpers';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Command your pet to tear into your target, causing your target to bleed for
 * [Attack power * 0.25 * 6 * 1 * (1 + Versatility) * 1] over 18 sec and
 * increase all damage taken from your pet by 15% for 18 sec.
 *
 * TODO: Verify if this still only still works from main pet (Say if you use Animal Companion and have two pets)
 */

class Bloodshed extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  bleedDamage = 0;
  increasedDamage = 0;
  pets: Array<{ petName: string; sourceID: number | undefined; damage: number }> = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLOODSHED_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOODSHED_DEBUFF),
      this.onDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onDamage(event: DamageEvent) {
    this.bleedDamage += event.amount + (event.absorbed || 0);
  }

  onPetDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.BLOODSHED_DEBUFF.id)) {
      return;
    }
    const foundPet = this.pets.find(
      (pet: { sourceID: number | undefined }) => pet.sourceID === event.sourceID,
    );
    const damage = calculateEffectiveDamage(event, BLOODSHED_DAMAGE_AMP);
    if (!foundPet) {
      const sourcePet = this.owner.playerPets.find(
        (pet: { id: number | undefined }) => pet.id === event.sourceID,
      );
      if (!sourcePet || !isPermanentPet(sourcePet.guid)) {
        return;
      }
      this.pets.push({
        petName: sourcePet.name,
        sourceID: event.sourceID,
        damage: damage,
      });
    } else {
      foundPet.damage += damage;
    }
  }

  onFightEnd() {
    let max = 0;
    this.pets.forEach((pet: { damage: number; petName: string }) => {
      if (pet.damage > max) {
        max = pet.damage;
        this.increasedDamage = pet.damage;
      }
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.BLOODSHED_TALENT.id}>
          <>
            <ItemDamageDone amount={this.bleedDamage} /> <small>bleed damage</small>
            <ItemDamageDone amount={this.increasedDamage} /> <small>damage amp</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Bloodshed;
