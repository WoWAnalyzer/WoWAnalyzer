import { RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE } from 'analysis/retail/hunter-beastmastery/constants';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * While Bestial Wrath is active, your pet's critical damage dealt is increased by 35%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/TqAf9F8tKkL4NWCj#fight=50&type=damage-done
 */
class RylakstalkersPiercingFangs extends Analyzer {
  damage = 0;
  lastCritTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  onPetDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    if (
      event.ability.guid === SPELLS.BEAST_CLEAVE_DAMAGE.id &&
      event.timestamp < this.lastCritTimestamp + MS_BUFFER_100
    ) {
      this.damage += calculateEffectiveDamage(
        event,
        RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE,
      );
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    this.lastCritTimestamp = event.timestamp;
    this.damage += calculateEffectiveDamage(event, RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RylakstalkersPiercingFangs;
