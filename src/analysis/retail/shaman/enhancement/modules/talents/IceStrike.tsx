import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Strike your target with an icy blade, dealing (65% of Attack power)
 * Frost damage and snaring them by 50% for 6 sec.
 *
 * Successful Ice Strikes reset the cooldown of your Flame Shock and
 * Frost Shock spells.
 *
 * Example Log:
 */
class IceStrike extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  protected casts: number = 0;
  protected cooldownReduced: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ICE_STRIKE_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.ICE_STRIKE_TALENT),
      this.onIceStrikeDamage,
    );
  }

  onIceStrikeDamage() {
    this.casts += 1;

    if (this.spellUsable.isOnCooldown(SPELLS.FLAME_SHOCK.id)) {
      this.cooldownReduced += this.spellUsable.cooldownRemaining(SPELLS.FLAME_SHOCK.id);
      this.spellUsable.endCooldown(SPELLS.FLAME_SHOCK.id);
    }
  }

  statistic() {
    const shockCooldownReducedInSeconds = this.cooldownReduced / 1000.0;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`You cast Ice Strike ${
          this.casts
        } times, for a total shock cooldown reduction of ${formatNumber(
          shockCooldownReducedInSeconds,
        )} seconds.`}
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.ICE_STRIKE_TALENT.id}>
          <>
            {formatNumber(shockCooldownReducedInSeconds / this.casts)}s{' '}
            <small> avg. Shock Cooldown Reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IceStrike;
