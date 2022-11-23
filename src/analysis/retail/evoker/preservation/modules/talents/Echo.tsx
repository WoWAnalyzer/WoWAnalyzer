import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ECHO_HEALS, SPELL_COLORS } from '../../constants';
import { isFromHardcastEcho, isFromTAEcho } from '../../normalizers/CastLinkNormalizer';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';

class Echo extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerPrevoker,
  };

  protected hotTracker!: HotTrackerPrevoker;

  // Map<spellId, totalHealing>, only update for echo healing
  echoHealingBySpell: Map<number, number> = new Map<number, number>();
  taEchoHealingBySpell: Map<number, number> = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    ECHO_HEALS.forEach((spell) => {
      this.echoHealingBySpell.set(spell.id, 0);
      this.taEchoHealingBySpell.set(spell.id, 0);
    });
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(ECHO_HEALS), this.handleEchoHeal);
  }

  handleEchoHeal(event: HealEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (event.tick) {
      if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
        return;
      }
      const hot = this.hotTracker.hots[targetID][spellID];
      if (!this.hotTracker.fromEchoHardcast(hot) && !this.hotTracker.fromEchoTA(hot)) {
        return;
      }
    } else if (!isFromTAEcho(event) && !isFromHardcastEcho(event)) {
      return;
    }
    const mapRef = this.isFromTaEcho(event) ? this.taEchoHealingBySpell : this.echoHealingBySpell;
    mapRef.set(
      event.ability.guid,
      mapRef.get(event.ability.guid)! + (event.amount || 0) + (event.absorbed || 0),
    );
  }

  isFromTaEcho(event: HealEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (event.tick) {
      if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
        return;
      }
      const hot = this.hotTracker.hots[targetID][spellID];
      return this.hotTracker.fromEchoTA(hot);
    }
    return isFromTAEcho(event);
  }

  get totalTaEchoHealing() {
    let result = 0;
    for (const amount of this.taEchoHealingBySpell.values()) {
      result += amount;
    }
    return result;
  }

  get totalHardcastEchoHealing() {
    let result = 0;
    for (const amount of this.echoHealingBySpell.values()) {
      result += amount;
    }
    return result;
  }

  totalEchoHealingForSpell(spellId: number) {
    return (
      (this.echoHealingBySpell.get(spellId) || 0) + (this.taEchoHealingBySpell.get(spellId) || 0)
    );
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.DREAM_BREATH,
        label: 'Dream Breath',
        spellId: TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
        value: this.totalEchoHealingForSpell(SPELLS.DREAM_BREATH_ECHO.id),
        valueTooltip: formatNumber(this.totalEchoHealingForSpell(SPELLS.DREAM_BREATH_ECHO.id)),
      },
      {
        color: SPELL_COLORS.SPIRITBLOOM,
        label: 'Spiritbloom',
        spellId: TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
        value:
          this.totalEchoHealingForSpell(SPELLS.SPIRITBLOOM.id) +
          this.totalEchoHealingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        valueTooltip: formatNumber(
          this.totalEchoHealingForSpell(SPELLS.SPIRITBLOOM.id) +
            this.totalEchoHealingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        ),
      },
      {
        color: SPELL_COLORS.LIVING_FLAME,
        label: 'Living Flame',
        spellId: SPELLS.LIVING_FLAME_HEAL.id,
        value: this.totalEchoHealingForSpell(SPELLS.LIVING_FLAME_HEAL.id),
        valueTooltip: formatNumber(this.totalEchoHealingForSpell(SPELLS.LIVING_FLAME_HEAL.id)),
      },
      {
        color: SPELL_COLORS.REVERSION,
        label: 'Reversion',
        spellId: TALENTS_EVOKER.REVERSION_TALENT.id,
        value: this.totalEchoHealingForSpell(SPELLS.REVERSION_ECHO.id),
        valueTooltip: formatNumber(this.totalEchoHealingForSpell(SPELLS.REVERSION_ECHO.id)),
      },
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM.id,
        value: this.totalEchoHealingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id),
        valueTooltip: formatNumber(this.totalEchoHealingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id)),
      },
      {
        color: SPELL_COLORS.VERDANT_EMBRACE,
        label: 'Verdant Embrace',
        spellId: TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
        value: this.totalEchoHealingForSpell(TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id),
        valueTooltip: formatNumber(
          this.totalEchoHealingForSpell(TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id),
        ),
      },
      {
        color: SPELL_COLORS.FLUTTERING_SEEDLING,
        label: 'Fluttering Seedling',
        spellId: TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT.id,
        value: this.totalEchoHealingForSpell(SPELLS.FLUTTERING_SEEDLINGS_HEAL.id),
        valueTooltip: formatNumber(
          this.totalEchoHealingForSpell(SPELLS.FLUTTERING_SEEDLINGS_HEAL.id),
        ),
      },
    ].filter((item) => {
      return item.value > 0;
    });
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
            <SpellLink id={TALENTS_EVOKER.ECHO_TALENT} /> healing breakdown by spell
          </label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default Echo;
