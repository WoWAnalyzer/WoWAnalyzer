import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import MAGIC_SCHOOLS, { color as magicSchoolColor, isMatchingDamageType } from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';

const FERAL_SPIRIT_DAMAGE_INCREASE = 0.05;

/**
 * Casting Sundering summons 1 Fire Feral Spirit
 * and Doom Winds summons 1 Nature Feral Spirit by your side for 8 sec.
 *
 * Feral Spirit
 * An Elemental Spirit Wolf infused with Fire or Nature magic,
 * granting the summoner with 5% increased Fire or Nature damage
 * and 5% Physical damage for 8 sec.
 */

class FeralSpirit extends Analyzer {
  private fireDamageGained = 0;
  private natureDamageGained = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.FERAL_SPIRIT_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  private onDamage(event: DamageEvent) {
    const hasFireSpirit = this.selectedCombatant.hasBuff(
      SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON.id,
      event.timestamp,
    );
    const hasNatureSpirit = this.selectedCombatant.hasBuff(
      SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE.id,
      event.timestamp,
    );

    if (hasFireSpirit && isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.FIRE)) {
      this.fireDamageGained += calculateEffectiveDamage(event, FERAL_SPIRIT_DAMAGE_INCREASE);
    }
    if (hasNatureSpirit && isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.NATURE)) {
      this.natureDamageGained += calculateEffectiveDamage(event, FERAL_SPIRIT_DAMAGE_INCREASE);
    }
  }

  private get totalDamageGained() {
    return this.fireDamageGained + this.natureDamageGained;
  }

  private makeBars(): TalentAggregateBarSpec[] {
    return [
      {
        spell: SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON,
        amount: this.fireDamageGained,
        color: magicSchoolColor(MAGIC_SCHOOLS.ids.FIRE),
      },
      {
        spell: SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE,
        amount: this.natureDamageGained,
        color: magicSchoolColor(MAGIC_SCHOOLS.ids.NATURE),
      },
    ];
  }

  statistic() {
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS.FERAL_SPIRIT_TALENT} /> -{' '}
            <ItemDamageDone amount={this.totalDamageGained} />
          </>
        }
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        wide
      >
        <TalentAggregateBars bars={this.makeBars()} wide />
      </TalentAggregateStatisticContainer>
    );
  }
}

export default FeralSpirit;
