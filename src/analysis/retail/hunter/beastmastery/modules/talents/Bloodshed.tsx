import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Bestial Wrath provokes your pets to tear into your target, causing your target to bleed for
 * damage over 12 sec.
 *
 * Every active pet (including the second pet from Animal Companion) applies the bleed, so debuff
 * applications aren't meaningful on their own - damage per Bestial Wrath cast is.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/fFABwW13pL4xqtrd#fight=7&type=damage-done&ability=321538
 */
class Bloodshed extends Analyzer {
  damage = 0;
  bestialWrathCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLOODSHED_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.BLOODSHED_DEBUFF),
      this.onBleedDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BESTIAL_WRATH_TALENT),
      this.onBestialWrathCast,
    );
  }

  onBleedDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onBestialWrathCast() {
    this.bestialWrathCasts += 1;
  }

  get damagePerBestialWrath() {
    return this.bestialWrathCasts > 0 ? this.damage / this.bestialWrathCasts : 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Your pets' <SpellLink spell={TALENTS.BLOODSHED_TALENT} /> bleed dealt{' '}
            {formatNumber(this.damage)} damage over {this.bestialWrathCasts}{' '}
            <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> casts.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.BLOODSHED_TALENT}>
          <ItemDamageDone amount={this.damage} />
          <p>
            {formatNumber(this.damagePerBestialWrath)} <small>damage per Bestial Wrath</small>
          </p>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Bloodshed;
