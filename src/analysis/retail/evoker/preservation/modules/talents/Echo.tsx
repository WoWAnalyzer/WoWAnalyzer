import { t } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  GetRelatedEvents,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ECHO_HEALS, SPELL_COLORS } from '../../constants';
import {
  didEchoExpire,
  ECHO,
  ECHO_TEMPORAL_ANOMALY,
  isFromHardcastEcho,
  isFromTAEcho,
} from '../../normalizers/CastLinkNormalizer';
import HotTrackerPrevoker from '../core/HotTrackerPrevoker';

class Echo extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerPrevoker,
  };

  protected hotTracker!: HotTrackerPrevoker;

  consumptionsBySpell: Map<number, number> = new Map<number, number>();
  // Map<spellId, totalHealing>, only update for echo healing
  echoHealingBySpell: Map<number, number> = new Map<number, number>();
  taEchoHealingBySpell: Map<number, number> = new Map<number, number>();
  totalApplied: number = 0;
  totalExpired: number = 0;

  constructor(options: Options) {
    super(options);
    ECHO_HEALS.forEach((spell) => {
      this.echoHealingBySpell.set(spell.id, 0);
      this.taEchoHealingBySpell.set(spell.id, 0);
      this.consumptionsBySpell.set(spell.id, 0);
    });
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(ECHO_HEALS), this.handleEchoHeal);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.onRemove,
    );
  }

  onRemove(event: RemoveBuffEvent) {
    if (didEchoExpire(event)) {
      this.totalExpired += 1;
    } else {
      // consumed echo with a spell
      const relatedEvents = GetRelatedEvents(event, ECHO).concat(
        GetRelatedEvents(event, ECHO_TEMPORAL_ANOMALY),
      );
      const spellID = (relatedEvents[0] as CastEvent).ability.guid;
      this.consumptionsBySpell.set(spellID, this.consumptionsBySpell.get(spellID)! + 1);
    }
  }

  handleEchoHeal(event: HealEvent) {
    if (!this.isEchoHeal(event)) {
      return;
    }
    const spellID = event.ability.guid;
    const mapRef = this.isFromTaEcho(event) ? this.taEchoHealingBySpell : this.echoHealingBySpell;
    mapRef.set(spellID, mapRef.get(spellID)! + (event.amount || 0) + (event.absorbed || 0));
  }

  isEchoHeal(event: HealEvent) {
    const targetID = event.targetID;
    const spellID = event.ability.guid;
    if (event.tick) {
      if (!this.hotTracker.hots[targetID] || !this.hotTracker.hots[targetID][spellID]) {
        return false;
      }
      const hot = this.hotTracker.hots[targetID][spellID];
      return this.hotTracker.fromEchoHardcast(hot) || this.hotTracker.fromEchoTA(hot);
    }
    return isFromHardcastEcho(event) || isFromTAEcho(event);
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

  get suggestionThresholds() {
    return {
      actual: this.totalExpired,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid letting <SpellLink id={TALENTS_EVOKER.ECHO_TALENT.id} /> buffs expire.
        </>,
      )
        .icon(TALENTS_EVOKER.ECHO_TALENT.icon)
        .actual(
          `${actual} ${t({
            id: 'evoker.preservation.suggestions.echo.wastedBuffs',
            message: ` wasted Echo buff${actual > 1 ? 's' : ''}`,
          })}`,
        )
        .recommended(`${recommended} wasted buffs recommended`),
    );
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
        valueTooltip:
          formatNumber(this.totalEchoHealingForSpell(SPELLS.DREAM_BREATH_ECHO.id)) +
          ' in ' +
          this.consumptionsBySpell.get(SPELLS.DREAM_BREATH_ECHO.id) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.SPIRITBLOOM,
        label: 'Spiritbloom',
        spellId: TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
        value:
          this.totalEchoHealingForSpell(SPELLS.SPIRITBLOOM.id) +
          this.totalEchoHealingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
        valueTooltip:
          formatNumber(
            this.totalEchoHealingForSpell(SPELLS.SPIRITBLOOM.id) +
              this.totalEchoHealingForSpell(SPELLS.SPIRITBLOOM_SPLIT.id),
          ) +
          ' in ' +
          (this.consumptionsBySpell.get(SPELLS.SPIRITBLOOM.id)! +
            this.consumptionsBySpell.get(SPELLS.SPIRITBLOOM_SPLIT.id)!) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.LIVING_FLAME,
        label: 'Living Flame',
        spellId: SPELLS.LIVING_FLAME_HEAL.id,
        value: this.totalEchoHealingForSpell(SPELLS.LIVING_FLAME_HEAL.id),
        valueTooltip:
          formatNumber(this.totalEchoHealingForSpell(SPELLS.LIVING_FLAME_HEAL.id)) +
          ' in ' +
          this.consumptionsBySpell.get(SPELLS.LIVING_FLAME_HEAL.id) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.REVERSION,
        label: 'Reversion',
        spellId: TALENTS_EVOKER.REVERSION_TALENT.id,
        value: this.totalEchoHealingForSpell(SPELLS.REVERSION_ECHO.id),
        valueTooltip:
          formatNumber(this.totalEchoHealingForSpell(SPELLS.REVERSION_ECHO.id)) +
          ' in ' +
          this.consumptionsBySpell.get(SPELLS.REVERSION_ECHO.id) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM.id,
        value: this.totalEchoHealingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id),
        valueTooltip:
          formatNumber(this.totalEchoHealingForSpell(SPELLS.EMERALD_BLOSSOM_ECHO.id)) +
          ' in ' +
          this.consumptionsBySpell.get(SPELLS.EMERALD_BLOSSOM_ECHO.id) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.VERDANT_EMBRACE,
        label: 'Verdant Embrace',
        spellId: SPELLS.VERDANT_EMBRACE_HEAL.id,
        value: this.totalEchoHealingForSpell(SPELLS.VERDANT_EMBRACE_HEAL.id),
        valueTooltip:
          formatNumber(this.totalEchoHealingForSpell(SPELLS.VERDANT_EMBRACE_HEAL.id)) +
          ' in ' +
          this.consumptionsBySpell.get(SPELLS.VERDANT_EMBRACE_HEAL.id) +
          ' consumptions',
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
