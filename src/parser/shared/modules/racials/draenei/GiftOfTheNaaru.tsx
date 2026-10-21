import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const GIFT_OF_THE_NAARU_SPELLS = [
  SPELLS.GIFT_OF_THE_NAARU_DK,
  SPELLS.GIFT_OF_THE_NAARU_HUNTER,
  SPELLS.GIFT_OF_THE_NAARU_MONK,
  SPELLS.GIFT_OF_THE_NAARU_MAGE,
  SPELLS.GIFT_OF_THE_NAARU_PRIEST,
  SPELLS.GIFT_OF_THE_NAARU_PALADIN,
  SPELLS.GIFT_OF_THE_NAARU_SHAMAN,
  SPELLS.GIFT_OF_THE_NAARU_WARRIOR,
];

/**
 * Heals the target for 20% of the caster's total health over 5 sec.
 */
class GiftOfTheNaaru extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  casts = 0;
  healing = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.race === RACES.Draenei;
    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: GIFT_OF_THE_NAARU_SPELLS.map((spell) => spell.id),
      category: SPELL_CATEGORY.DEFENSIVE,
      cooldown: 120,
      gcd: null,
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(GIFT_OF_THE_NAARU_SPELLS),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(GIFT_OF_THE_NAARU_SPELLS),
      this.onHeal,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  onHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  get rawHealing() {
    return this.healing + this.overhealing;
  }

  get overhealPercentage() {
    return this.rawHealing > 0 ? this.overhealing / this.rawHealing : 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            <p>
              {formatNumber(this.overhealing)} ({formatPercentage(this.overhealPercentage)}%)
              Overheal
            </p>
            <p>
              {this.casts} {this.casts === 1 ? 'cast' : 'casts'}
            </p>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.GIFT_OF_THE_NAARU_DK}>
          <p>{formatNumber(this.healing)} healing</p>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GiftOfTheNaaru;
