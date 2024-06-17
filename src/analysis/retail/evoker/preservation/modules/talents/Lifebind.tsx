import { formatNumber } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELL_COLORS } from '../../constants';
import { getHealForLifebindHeal } from '../../normalizers/EventLinking/helpers';
import Combatants from 'parser/shared/modules/Combatants';

class Lifebind extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healingBySpell: Map<number, number> = new Map<number, number>();
  curNumLifebinds: number = 0;
  protected combatants!: Combatants;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.LIFEBIND_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBIND_HEAL), this.onHeal);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBIND_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBIND_BUFF),
      this.onRemove,
    );
  }

  onHeal(event: HealEvent) {
    const triggerSpell = getHealForLifebindHeal(event);
    const spellID = triggerSpell ? triggerSpell.ability.guid : 0;
    this.healingBySpell.set(
      spellID,
      (this.healingBySpell.get(spellID) ?? 0) + event.amount + (event.absorbed || 0),
    );
  }

  onApply(event: ApplyBuffEvent) {
    if (!this.combatants.getEntity(event)) {
      return;
    }
    this.curNumLifebinds += 1;
  }

  onRemove(event: RemoveBuffEvent) {
    if (!this.combatants.getEntity(event)) {
      return;
    }
    this.curNumLifebinds -= 1;
  }

  healingForSpell(spellId: number): number {
    return this.healingBySpell.get(spellId) ?? 0;
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.DREAM_BREATH,
        label: 'Dream Breath',
        spellId: TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
        value:
          this.healingForSpell(SPELLS.DREAM_BREATH_ECHO.id) +
          this.healingForSpell(SPELLS.DREAM_BREATH.id),
        valueTooltip: formatNumber(
          this.healingForSpell(SPELLS.DREAM_BREATH_ECHO.id) +
            this.healingForSpell(SPELLS.DREAM_BREATH.id),
        ),
      },
      {
        color: SPELL_COLORS.SPIRITBLOOM,
        label: 'Spiritbloom',
        spellId: TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
        value:
          this.healingForSpell(SPELLS.SPIRITBLOOM.id) +
          this.healingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        valueTooltip: formatNumber(
          this.healingForSpell(SPELLS.SPIRITBLOOM.id) +
            this.healingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        ),
      },
      {
        color: SPELL_COLORS.LIVING_FLAME,
        label: 'Living Flame',
        spellId: SPELLS.LIVING_FLAME_HEAL.id,
        value: this.healingForSpell(SPELLS.LIVING_FLAME_HEAL.id),
        valueTooltip: formatNumber(this.healingForSpell(SPELLS.LIVING_FLAME_HEAL.id)),
      },
      {
        color: SPELL_COLORS.REVERSION,
        label: 'Reversion',
        spellId: TALENTS_EVOKER.REVERSION_TALENT.id,
        value:
          this.healingForSpell(SPELLS.REVERSION_ECHO.id) +
          this.healingForSpell(TALENTS_EVOKER.REVERSION_TALENT.id),
        valueTooltip: formatNumber(
          this.healingForSpell(SPELLS.REVERSION_ECHO.id) +
            this.healingForSpell(TALENTS_EVOKER.REVERSION_TALENT.id),
        ),
      },
      {
        color: '#301934',
        label: "Broodkeeper's Promise",
        spellId: ITEMS.BROODKEEPERS_PROMISE_HEAL.id,
        value: this.healingForSpell(ITEMS.BROODKEEPERS_PROMISE_HEAL.id),
        valueTooltip: formatNumber(this.healingForSpell(ITEMS.BROODKEEPERS_PROMISE_HEAL.id)),
      },
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM.id,
        value:
          this.healingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id) +
          this.healingForSpell(SPELLS.EMERALD_BLOSSOM.id),
        valueTooltip: formatNumber(
          this.healingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id) +
            this.healingForSpell(SPELLS.EMERALD_BLOSSOM.id),
        ),
      },
      {
        color: SPELL_COLORS.VERDANT_EMBRACE,
        label: 'Verdant Embrace',
        spellId: SPELLS.VERDANT_EMBRACE_HEAL.id,
        value: this.healingForSpell(SPELLS.VERDANT_EMBRACE_HEAL.id),
        valueTooltip: formatNumber(this.healingForSpell(SPELLS.VERDANT_EMBRACE_HEAL.id)),
      },
      {
        color: SPELL_COLORS.RENEWING_BLAZE,
        label: 'Renewing Blaze',
        spellId: SPELLS.RENEWING_BLAZE_HEAL.id,
        value: this.healingForSpell(SPELLS.RENEWING_BLAZE_HEAL.id),
        valueTooltip: formatNumber(this.healingForSpell(SPELLS.RENEWING_BLAZE_HEAL.id)),
      },
      {
        color: SPELL_COLORS.ECHO,
        label: 'Echo',
        spellId: TALENTS_EVOKER.ECHO_TALENT.id,
        value: this.healingForSpell(TALENTS_EVOKER.ECHO_TALENT.id),
        valueTooltip: formatNumber(this.healingForSpell(TALENTS_EVOKER.ECHO_TALENT.id)),
      },
      {
        color: SPELL_COLORS.FLUTTERING_SEEDLING,
        label: 'Fluttering Seedling',
        spellId: SPELLS.FLUTTERING_SEEDLINGS_HEAL.id,
        value: this.healingForSpell(SPELLS.FLUTTERING_SEEDLINGS_HEAL.id),
        valueTooltip: formatNumber(this.healingForSpell(SPELLS.FLUTTERING_SEEDLINGS_HEAL.id)),
      },
      {
        color: SPELL_COLORS.DREAM_FLIGHT,
        label: 'Dream Flight',
        spellId: SPELLS.DREAM_FLIGHT_HEAL.id,
        value: this.healingForSpell(SPELLS.DREAM_FLIGHT_HEAL.id),
        valueTooltip: formatNumber(this.healingForSpell(SPELLS.DREAM_FLIGHT_HEAL.id)),
      },
      {
        color: SPELL_COLORS.REWIND,
        label: 'Rewind',
        spellId: TALENTS_EVOKER.REWIND_TALENT.id,
        value: this.healingForSpell(TALENTS_EVOKER.REWIND_TALENT.id),
        valueTooltip: formatNumber(this.healingForSpell(TALENTS_EVOKER.REWIND_TALENT.id)),
      },
      {
        color: SPELL_COLORS.CYCLE_OF_LIFE,
        label: 'Cycle of Life',
        spellId: SPELLS.CYCLE_OF_LIFE_HEAL.id,
        value: this.healingForSpell(SPELLS.CYCLE_OF_LIFE_HEAL.id),
        valueTooltip: formatNumber(this.healingForSpell(SPELLS.CYCLE_OF_LIFE_HEAL.id)),
      },
      {
        color: SPELL_COLORS.EMERALD_COMMUNION,
        label: 'Emerald Communion',
        spellId: TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id,
        value:
          this.healingForSpell(SPELLS.EMERALD_COMMUNION_ALLY.id) +
          this.healingForSpell(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id),
        valueTooltip: formatNumber(
          this.healingForSpell(SPELLS.EMERALD_COMMUNION_ALLY.id) +
            this.healingForSpell(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id),
        ),
      },
      {
        color: '#828282',
        label: 'Other',
        spellId: 0,
        value: this.healingForSpell(0),
        valueTooltip:
          formatNumber(this.healingForSpell(0)) +
          ' (This includes misc items, trinkets, and other sources of non-spell healing)',
      },
    ]
      .filter((item) => {
        return item.value > 0 && item.value >= this.healingForSpell(0);
      })
      .sort((a, b) => {
        return Math.sign(b.value - a.value);
      });
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} />{' '}
            <small>healing breakdown by spell</small>
            <br />
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default Lifebind;
