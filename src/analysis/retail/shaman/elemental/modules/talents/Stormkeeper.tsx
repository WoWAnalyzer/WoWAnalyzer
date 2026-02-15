import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { ON_CAST_BUFF_REMOVAL_GRACE_MS } from '../../constants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const SK_DAMAGE_AFFECTED_ABILITIES = [
  SPELLS.LIGHTNING_BOLT_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  TALENTS.CHAIN_LIGHTNING_TALENT,
];
class Stormkeeper extends Analyzer {
  damageDoneByBuffedCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasTalent(TALENTS.STORMKEEPER_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.ROLLING_THUNDER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SK_DAMAGE_AFFECTED_ABILITIES),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        event.timestamp,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      )
    ) {
      return;
    }

    this.damageDoneByBuffedCasts += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.STORMKEEPER_TALENT}>
          <>
            <ItemDamageDone amount={this.damageDoneByBuffedCasts} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormkeeper;
