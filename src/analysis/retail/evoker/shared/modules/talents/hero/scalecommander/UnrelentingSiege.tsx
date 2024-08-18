import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { UNRELENTING_SIEGE_MULTIPLIER_PER_STACK } from 'analysis/retail/evoker/shared/constants';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Spell from 'common/SPELLS/Spell';
import DonutChart from 'parser/ui/DonutChart';

const AMPED_SPELLS = [
  SPELLS.DISINTEGRATE,
  SPELLS.LIVING_FLAME_DAMAGE,
  SPELLS.AZURE_STRIKE,
  TALENTS.ERUPTION_TALENT,
];
const COLORS = [
  'rgb(41, 134, 204)', // Disintegrate
  'rgb(216, 59, 59)', // Living Flame
  'rgb(153, 102, 255)', // Azure Strike
  'rgb(129, 52, 5)', // Eruption
];

/**
 * For each second you are in combat, Azure Strike, Living Flame, and Disintegrate/Eruption
 * deal 1% increased damage, up to 15%.
 */
class UnrelentingSiege extends Analyzer {
  damageMap: Map<number, { spell: Spell; color: string; amount: number }> = new Map();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNRELENTING_SIEGE_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AMPED_SPELLS), this.onDamage);

    AMPED_SPELLS.forEach((spell) => {
      this.damageMap.set(spell.id, {
        spell,
        color: COLORS[AMPED_SPELLS.indexOf(spell)],
        amount: 0,
      });
    });
  }

  onDamage(event: DamageEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.UNRELENTING_SIEGE_BUFF.id);
    if (!stacks) {
      return;
    }

    const spell = this.damageMap.get(event.ability.guid);
    if (!spell) {
      // Essentially impossible to get here, but just in case
      console.warn(
        'UnrelentingSiege module could not find spell in damageMap',
        event.ability.name +
          `(${event.ability.guid}) @` +
          this.owner.formatTimestamp(event.timestamp),
      );
      return;
    }

    spell.amount += calculateEffectiveDamage(
      event,
      stacks * UNRELENTING_SIEGE_MULTIPLIER_PER_STACK,
    );
  }

  statistic() {
    let totalDamage = 0;

    const damageItems = Array.from(this.damageMap.values())
      .filter((source) => source.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .map((source) => {
        totalDamage += source.amount;

        return {
          color: source.color,
          label: source.spell.name,
          spellId: source.spell.id,
          valueTooltip: formatNumber(source.amount),
          value: source.amount,
        };
      });

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={<li>Damage: {formatNumber(totalDamage)}</li>}
      >
        <TalentSpellText talent={TALENTS.UNRELENTING_SIEGE_TALENT}>
          <ItemDamageDone amount={totalDamage} />
        </TalentSpellText>

        <div className="pad">
          <label>Damage sources</label>
          <DonutChart items={damageItems} />
        </div>
      </Statistic>
    );
  }
}

export default UnrelentingSiege;
