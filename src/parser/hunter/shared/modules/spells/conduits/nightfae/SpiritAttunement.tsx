import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Analyzer, { Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SPIRIT_ATTUNEMENT_DAMAGE_INCREASE, WILD_MARK_DAMAGE_AMP, WILD_SPIRITS_BASELINE_DURATION } from 'parser/hunter/shared/constants';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import React from 'react';
import { formatNumber, formatThousands } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

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

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && this.selectedCombatant.hasConduitBySpellID(SPELLS.SPIRIT_ATTUNEMENT_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SPIRIT_ATTUNEMENT_CONDUIT.id);

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
        <ConduitSpellText spell={SPELLS.SPIRIT_ATTUNEMENT_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
            <br />
            {formatNumber(this.damageAfterOriginalDuration)} <small>damage after normal duration</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default SpiritAttunement;
