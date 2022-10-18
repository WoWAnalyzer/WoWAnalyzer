import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DREADLASH_BONUS_DAMAGE = 0.25;
const debug = false;

class Dreadlash extends Analyzer {
  _primaryTarget = null;
  cleavedDamage = 0;
  bonusDamage = 0; // only from primary target

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DREADLASH_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.DREADBITE),
      this.handleDreadbite,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CALL_DREADSTALKERS),
      this.handleDreadstalkerCast,
    );
  }

  handleDreadbite(event) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this._primaryTarget === target) {
      debug && this.log(`Dreadbite damage on ${target}, primary`);
      this.bonusDamage += calculateEffectiveDamage(event, DREADLASH_BONUS_DAMAGE);
    } else {
      debug && this.log(`Dreadbite damage on ${target}, cleaved`);
      this.cleavedDamage += event.amount + (event.absorbed || 0);
    }
  }

  handleDreadstalkerCast(event) {
    this._primaryTarget = encodeTargetString(event.targetID, event.targetInstance);
    debug && this.log(`Dreadstalkers cast on ${this._primaryTarget}`);
  }

  statistic() {
    const total = this.cleavedDamage + this.bonusDamage;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(total)} bonus damage
            <br />
            Bonus damage on primary target hits: {formatThousands(this.bonusDamage)} (
            {this.owner.formatItemDamageDone(this.bonusDamage)})<br />
            Bonus cleaved damage: {formatThousands(this.cleavedDamage)} (
            {this.owner.formatItemDamageDone(this.cleavedDamage)})
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.DREADLASH_TALENT.id}>
          <ItemDamageDone amount={total} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Dreadlash;
