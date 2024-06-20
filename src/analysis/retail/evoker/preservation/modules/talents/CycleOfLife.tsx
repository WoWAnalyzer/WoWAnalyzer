import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, SummonEvent } from 'parser/core/Events';
import DonutChart, { Item } from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  CYCLE_OF_LIFE_PERCENT_SAVED,
  CYCLE_OF_LIFE_SEED_DURATION,
  CYCLE_SPELLS,
  SPELL_COLORS,
} from '../../constants';

const cycleSpells = new Set<number>(CYCLE_SPELLS);

class CycleOfLife extends Analyzer {
  savedBySpell: Map<number, number> = new Map<number, number>();
  seeds: number[] = []; // storing seed expiration times
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.CYCLE_OF_LIFE_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleHeal);
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.CYCLE_OF_LIFE_SUMMON),
      this.onSummon,
    );
  }

  onSummon(event: SummonEvent) {
    this.seeds.push(event.timestamp + CYCLE_OF_LIFE_SEED_DURATION + 150); // buffer for lag
  }

  handleHeal(event: HealEvent) {
    const curVal = this.savedBySpell.has(event.ability.guid)
      ? this.savedBySpell.get(event.ability.guid)
      : 0;
    const amount = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    const percentSaved = CYCLE_OF_LIFE_PERCENT_SAVED * this.getNumActiveSeeds(event.timestamp);
    this.savedBySpell.set(event.ability.guid, curVal! + amount * percentSaved);
  }

  getNumActiveSeeds(timestamp: number): number {
    // prune old seeds
    for (let i = this.seeds.length - 1; i >= 0; i -= 1) {
      if (this.seeds[i] < timestamp) {
        this.seeds.splice(i, 1);
      }
    }
    return this.seeds.length;
  }

  getOtherHealing(items: Item[]) {
    let totalHealing = 0;
    this.savedBySpell.forEach((value: number, key: number) => {
      if (!cycleSpells.has(key)) {
        totalHealing += value;
      }
    });
    const allVals = items.sort((a, b) => (a.value > b.value ? 1 : -1));
    const topVals = new Set<Item>(allVals.slice(-5));
    for (let i = items.length - 1; i >= 0; i -= 1) {
      if (!topVals.has(items[i])) {
        totalHealing += items[i].value;
        items.splice(i, 1);
      }
    }
    return totalHealing;
  }

  totalSavedBySpell(spellId: number) {
    return this.savedBySpell.get(spellId) || 0;
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.CYCLE_OF_LIFE,
        label: 'Cycle of Life',
        spellId: TALENTS_EVOKER.CYCLE_OF_LIFE_TALENT.id,
        value: this.totalSavedBySpell(SPELLS.CYCLE_OF_LIFE_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.CYCLE_OF_LIFE_HEAL.id)),
      },
      {
        color: SPELL_COLORS.DREAM_BREATH,
        label: 'Dream Breath',
        spellId: TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
        value:
          this.totalSavedBySpell(SPELLS.DREAM_BREATH_ECHO.id) +
          this.totalSavedBySpell(SPELLS.DREAM_BREATH.id),
        valueTooltip: formatNumber(
          this.totalSavedBySpell(SPELLS.DREAM_BREATH_ECHO.id) +
            this.totalSavedBySpell(SPELLS.DREAM_BREATH.id),
        ),
      },
      {
        color: SPELL_COLORS.DREAM_FLIGHT,
        label: 'Dream Flight',
        spellId: TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id,
        value: this.totalSavedBySpell(SPELLS.DREAM_FLIGHT_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.DREAM_FLIGHT_HEAL.id)),
      },
      {
        color: SPELL_COLORS.ECHO,
        label: 'Echo',
        spellId: TALENTS_EVOKER.ECHO_TALENT.id,
        value: this.totalSavedBySpell(TALENTS_EVOKER.ECHO_TALENT.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(TALENTS_EVOKER.ECHO_TALENT.id)),
      },
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM.id,
        value:
          this.totalSavedBySpell(SPELLS.EMERALD_BLOSSOM_ECHO.id) +
          this.totalSavedBySpell(SPELLS.EMERALD_BLOSSOM.id),
        valueTooltip: formatNumber(
          this.totalSavedBySpell(SPELLS.EMERALD_BLOSSOM_ECHO.id) +
            this.totalSavedBySpell(SPELLS.EMERALD_BLOSSOM.id),
        ),
      },
      {
        color: SPELL_COLORS.EMERALD_COMMUNION,
        label: 'Emerald Communion',
        spellId: TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id,
        value:
          this.totalSavedBySpell(SPELLS.EMERALD_COMMUNION_ALLY.id) +
          this.totalSavedBySpell(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id),
        valueTooltip: formatNumber(
          this.totalSavedBySpell(SPELLS.EMERALD_COMMUNION_ALLY.id) +
            this.totalSavedBySpell(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id),
        ),
      },
      {
        color: SPELL_COLORS.FLUTTERING_SEEDLING,
        label: 'Fluttering Seedling',
        spellId: TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT.id,
        value: this.totalSavedBySpell(SPELLS.FLUTTERING_SEEDLINGS_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.FLUTTERING_SEEDLINGS_HEAL.id)),
      },
      {
        color: SPELL_COLORS.LIFEBIND,
        label: 'Lifebind',
        spellId: TALENTS_EVOKER.LIFEBIND_TALENT.id,
        value: this.totalSavedBySpell(SPELLS.LIFEBIND_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.LIFEBIND_HEAL.id)),
      },
      {
        color: SPELL_COLORS.LIVING_FLAME,
        label: 'Living Flame',
        spellId: SPELLS.LIVING_FLAME_HEAL.id,
        value: this.totalSavedBySpell(SPELLS.LIVING_FLAME_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.LIVING_FLAME_HEAL.id)),
      },
      {
        color: SPELL_COLORS.RENEWING_BLAZE,
        label: 'Renewing Blaze',
        spellId: SPELLS.RENEWING_BLAZE_HEAL.id,
        value: this.totalSavedBySpell(SPELLS.RENEWING_BLAZE_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.RENEWING_BLAZE_HEAL.id)),
      },
      {
        color: SPELL_COLORS.REVERSION,
        label: 'Reversion',
        spellId: TALENTS_EVOKER.REVERSION_TALENT.id,
        value:
          this.totalSavedBySpell(SPELLS.REVERSION_ECHO.id) +
          this.totalSavedBySpell(TALENTS_EVOKER.REVERSION_TALENT.id),
        valueTooltip: formatNumber(
          this.totalSavedBySpell(SPELLS.REVERSION_ECHO.id) +
            this.totalSavedBySpell(TALENTS_EVOKER.REVERSION_TALENT.id),
        ),
      },
      {
        color: SPELL_COLORS.SPIRITBLOOM,
        label: 'Spiritbloom',
        spellId: TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
        value:
          this.totalSavedBySpell(SPELLS.SPIRITBLOOM.id) +
          this.totalSavedBySpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        valueTooltip: formatNumber(
          this.totalSavedBySpell(SPELLS.SPIRITBLOOM.id) +
            this.totalSavedBySpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        ),
      },
      {
        color: SPELL_COLORS.VERDANT_EMBRACE,
        label: 'Verdant Embrace',
        spellId: TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
        value: this.totalSavedBySpell(SPELLS.VERDANT_EMBRACE_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.VERDANT_EMBRACE_HEAL.id)),
      },
      {
        color: SPELL_COLORS.ENKINDLE,
        label: TALENTS_EVOKER.ENKINDLE_TALENT.name,
        spellId: TALENTS_EVOKER.ENKINDLE_TALENT.id,
        value: this.totalSavedBySpell(SPELLS.ENKINDLE_HOT.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.ENKINDLE_HOT.id)),
      },
      {
        color: SPELL_COLORS.ENGULF,
        label: TALENTS_EVOKER.ENGULF_TALENT.name,
        spellId: TALENTS_EVOKER.ENGULF_TALENT.id,
        value: this.totalSavedBySpell(SPELLS.ENGULF_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.ENGULF_HEAL.id)),
      },
      {
        color: SPELL_COLORS.CONSUME_FLAME,
        label: TALENTS_EVOKER.CONSUME_FLAME_TALENT.name,
        spellId: TALENTS_EVOKER.CONSUME_FLAME_TALENT.id,
        value: this.totalSavedBySpell(SPELLS.CONSUME_FLAME_HEAL.id),
        valueTooltip: formatNumber(this.totalSavedBySpell(SPELLS.CONSUME_FLAME_HEAL.id)),
      },
    ];
    const otherHealing = this.getOtherHealing(items);
    items.push({
      color: '#828282',
      label: 'Other',
      spellId: 0,
      value: otherHealing,
      valueTooltip: formatNumber(otherHealing),
    });
    items.sort((a, b) => (a.value < b.value ? 1 : -1));
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_EVOKER.CYCLE_OF_LIFE_TALENT} /> healing contribution by spell
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default CycleOfLife;
