import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * A two-headed shot that hits your primary target for (65% of Attack power)% Nature damage and another nearby target for  [(65% of Attack power)% * 0.5] Frost damage.
 * Replaces Arcane Shot.
 *
 * Example log:
 *
 */

class ChimaeraShot extends Analyzer {
  damage = 0;
  casts = 0;
  hits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.CHIMAERA_SHOT_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.CHIMAERA_SHOT_TALENT),
      () => {
        this.casts += 1;
      },
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.CHIMAERA_SHOT_MM_FROST_DAMAGE, SPELLS.CHIMAERA_SHOT_MM_NATURE_DAMAGE]),
      this.onChimaeraDamage,
    );
  }

  onChimaeraDamage(event: DamageEvent) {
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_HUNTER.CHIMAERA_SHOT_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChimaeraShot;
