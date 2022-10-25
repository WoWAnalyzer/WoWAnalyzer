import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { SpellLink } from 'interface';
import { LIONS_STRENGTH_DAMAGE_BONUS } from 'analysis/retail/druid/feral/constants';

// spells that are either directly or indirectly boosted by Lion's Strength
const LIONS_STRENGTH_BOOSTED_SPELLS = [
  SPELLS.RIP,
  SPELLS.FEROCIOUS_BITE,
  SPELLS.TEAR,
  SPELLS.TEAR_OPEN_WOUNDS,
  SPELLS.RAMPANT_FEROCITY,
];

/**
 * *Lion's Strength*
 * Spec Talent
 *
 * Ferocious Bite and Rip deal 15% increased damage
 */
export default class LionsStrength extends Analyzer {
  /** Total damage added by Lion's Strength */
  lsDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(LIONS_STRENGTH_BOOSTED_SPELLS),
      this.onLsDamage,
    );
  }

  onLsDamage(event: DamageEvent) {
    this.lsDamage += calculateEffectiveDamage(event, LIONS_STRENGTH_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This counts the talent's direct (<SpellLink id={SPELLS.RIP.id} />,{' '}
            <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />) and indirect (
            <SpellLink id={SPELLS.TEAR.id} />, <SpellLink id={SPELLS.TEAR_OPEN_WOUNDS.id} />,{' '}
            <SpellLink id={SPELLS.RAMPANT_FEROCITY.id} />) boosts.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.LIONS_STRENGTH_TALENT.id}>
          <ItemPercentDamageDone amount={this.lsDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
