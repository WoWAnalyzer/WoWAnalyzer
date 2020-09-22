import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SPIRIT_ATTUNEMENT_DAMAGE_INCREASE, WILD_MARK_DAMAGE_AMP, WILD_SPIRITS_BASELINE_DURATION } from 'parser/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatThousands } from 'common/format';

/**
 * Wild Spirits duration is increased by 3 sec and the damage dealt is increased by 10.0%.
 *
 * Example log
 *
 */
class SpiritAttunement extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;
  wildSpiritsCast: number = 0;
  damageAfterOriginalDuration: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.WILD_SPIRITS_DAMAGE, SPELLS.WILD_SPIRITS_DAMAGE_AOE]), this.onWildSpiritsDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onGenericDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_SPIRITS), this.onWildSpiritsCast);
  }

  onWildSpiritsCast(event: CastEvent) {
    this.wildSpiritsCast = event.timestamp;
  }

  onWildSpiritsDamage(event: DamageEvent) {
    this.addedDamage += calculateEffectiveDamage(event, SPIRIT_ATTUNEMENT_DAMAGE_INCREASE[this.conduitRank]);

    if (event.timestamp > this.wildSpiritsCast + WILD_SPIRITS_BASELINE_DURATION) {
      this.damageAfterOriginalDuration += event.amount + (event.absorbed || 0);
    }
  }

  onGenericDamage(event: DamageEvent) {
    if (event.timestamp > this.wildSpiritsCast + WILD_SPIRITS_BASELINE_DURATION) {
      this.damageAfterOriginalDuration += calculateEffectiveDamage(event, WILD_MARK_DAMAGE_AMP);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            After the original duration of Wild Spirits, Spirit Attunment contributed with {formatThousands(this.damageAfterOriginalDuration)}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SPIRIT_ATTUNEMENT_CONDUIT}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
            {formatThousands(this.damageAfterOriginalDuration)} <small>damage after normal duration</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default SpiritAttunement;
