import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import {
  getEssenceBurstConsumeAbility,
  isEbFromT31Tier,
  isEchoFromT314PC,
  isLfFromT31Tier,
} from '../../../normalizers/CastLinkNormalizer';
import { ESSENCE_COSTS } from '../../talents/EssenceBurst';
import { MANA_COSTS } from '../../talents/EssenceBurst';
import Soup from 'interface/icons/Soup';
import { SpellLink, TooltipElement } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import { TIERS } from 'game/TIERS';
import Echo from '../../talents/Echo';
import { ECHO_HEALS, SPELL_COLORS } from '../../../constants';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_T31_ID } from 'common/ITEMS/dragonflight';
import DonutChart from 'parser/ui/DonutChart';
import HotTrackerPrevoker from '../../core/HotTrackerPrevoker';

class T31PrevokerSet extends Analyzer {
  static dependencies = { echo: Echo, hot: HotTrackerPrevoker };
  has4Piece: boolean = false;
  manaSaved: number = 0;
  essenceSaved: number = 0;
  wastedEb: number = 0; // from EB buff refreshes
  totalEbProcs: number = 0;
  lfHealingHits: number = 0;
  lfHealing: number = 0;
  echoProcs: number = 0;
  echoHealing: number = 0;
  healingBySpell: Map<number, number> = new Map();
  consumptionsBySpell: Map<number, number> = new Map();
  protected echo!: Echo;
  protected hot!: HotTrackerPrevoker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T31);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T31);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onEbProc,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onEbProc,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onEbRefresh,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_HEAL),
      this.onLfHit,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(ECHO_HEALS), this.onEchoHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.onEchoHeal,
    );
  }

  onLfHit(event: HealEvent) {
    if (!isLfFromT31Tier(event)) {
      return;
    }
    this.lfHealing += event.amount + (event.absorbed || 0);
    this.lfHealingHits += 1;
  }

  onEbProc(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (!isEbFromT31Tier(event)) {
      return;
    }

    const castEvent = getEssenceBurstConsumeAbility(event);
    if (!castEvent) {
      return;
    }
    this.totalEbProcs += 1;
    this.essenceSaved += ESSENCE_COSTS[castEvent.ability.name];
    this.manaSaved += MANA_COSTS[castEvent.ability.name];
  }

  onEbRefresh(event: RefreshBuffEvent) {
    if (!isEbFromT31Tier(event)) {
      return;
    }
    this.wastedEb += 1;
  }

  onEchoHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (!isEchoFromT314PC(event)) {
      return;
    } else if (event.tick) {
      if (!this.hot.hots[event.targetID] || !this.hot.hots[event.targetID][spellId]) {
        return false;
      }
      const tracker = this.hot.hots[event.targetID][spellId];
      if (this.hot.fromEchoHardcast(tracker) || this.hot.fromEchoTA(tracker)) {
        return;
      }
    }
    this.echoHealing += event.amount + (event.absorbed || 0);
    this.healingBySpell.set(
      spellId,
      (this.totalHealingBySpell(spellId) ?? 0) + event.amount + (event.absorbed || 0),
    );
    if (!event.tick) {
      this.consumptionsBySpell.set(spellId, (this.consumptionsBySpell.get(spellId) ?? 0) + 1);
      this.echoProcs += 1;
    }
  }

  totalHealingBySpell(id: number) {
    return this.healingBySpell.get(id) ?? 0;
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.DREAM_BREATH,
        label: 'Dream Breath',
        spellId: TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
        value: this.totalHealingBySpell(SPELLS.DREAM_BREATH_ECHO.id),
        valueTooltip:
          formatNumber(this.totalHealingBySpell(SPELLS.DREAM_BREATH_ECHO.id)) +
          ' in ' +
          this.consumptionsBySpell.get(SPELLS.DREAM_BREATH_ECHO.id) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.SPIRITBLOOM,
        label: 'Spiritbloom',
        spellId: TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
        value:
          this.totalHealingBySpell(SPELLS.SPIRITBLOOM.id) +
          this.totalHealingBySpell(SPELLS.SPIRITBLOOM_SPLIT.id) +
          this.totalHealingBySpell(SPELLS.SPIRITBLOOM_FONT.id),
        valueTooltip:
          formatNumber(
            this.totalHealingBySpell(SPELLS.SPIRITBLOOM.id) +
              this.totalHealingBySpell(SPELLS.SPIRITBLOOM_SPLIT.id) +
              this.totalHealingBySpell(SPELLS.SPIRITBLOOM_FONT.id),
          ) +
          ' in ' +
          (this.consumptionsBySpell.get(SPELLS.SPIRITBLOOM.id)! +
            this.consumptionsBySpell.get(SPELLS.SPIRITBLOOM_SPLIT.id)! +
            this.consumptionsBySpell.get(SPELLS.SPIRITBLOOM_FONT.id)!) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.LIVING_FLAME,
        label: 'Living Flame',
        spellId: SPELLS.LIVING_FLAME_HEAL.id,
        value: this.totalHealingBySpell(SPELLS.LIVING_FLAME_HEAL.id),
        valueTooltip:
          formatNumber(this.totalHealingBySpell(SPELLS.LIVING_FLAME_HEAL.id)) +
          ' in ' +
          this.consumptionsBySpell.get(SPELLS.LIVING_FLAME_HEAL.id) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.REVERSION,
        label: 'Reversion',
        spellId: TALENTS_EVOKER.REVERSION_TALENT.id,
        value:
          this.totalHealingBySpell(SPELLS.REVERSION_ECHO.id) +
          this.totalHealingBySpell(SPELLS.GOLDEN_HOUR_HEAL.id),
        valueTooltip: (
          <>
            <SpellLink spell={TALENTS_EVOKER.REVERSION_TALENT} /> healing:{' '}
            {formatNumber(this.totalHealingBySpell(SPELLS.REVERSION_ECHO.id))} <br />
            and <SpellLink spell={TALENTS_EVOKER.GOLDEN_HOUR_TALENT} /> healing:{' '}
            {formatNumber(this.totalHealingBySpell(SPELLS.GOLDEN_HOUR_HEAL.id))} <br />
            in {this.consumptionsBySpell.get(SPELLS.REVERSION_ECHO.id) + ' consumptions'}
          </>
        ),
      },
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM.id,
        value: this.totalHealingBySpell(SPELLS.EMERALD_BLOSSOM_ECHO.id),
        valueTooltip:
          formatNumber(this.totalHealingBySpell(SPELLS.EMERALD_BLOSSOM_ECHO.id)) +
          ' in ' +
          this.consumptionsBySpell.get(SPELLS.EMERALD_BLOSSOM_ECHO.id) +
          ' consumptions',
      },
      {
        color: SPELL_COLORS.VERDANT_EMBRACE,
        label: 'Verdant Embrace',
        spellId: SPELLS.VERDANT_EMBRACE_HEAL.id,
        value:
          this.totalHealingBySpell(SPELLS.VERDANT_EMBRACE_HEAL.id) +
          this.totalHealingBySpell(SPELLS.LIFEBIND_HEAL.id),
        valueTooltip: (
          <>
            <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> healing:{' '}
            {formatNumber(this.totalHealingBySpell(SPELLS.VERDANT_EMBRACE_HEAL.id))} <br />
            and <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> healing:{' '}
            {formatNumber(this.totalHealingBySpell(SPELLS.LIFEBIND_HEAL.id))} <br />
            in {this.consumptionsBySpell.get(SPELLS.VERDANT_EMBRACE_HEAL.id) + ' consumptions'}
          </>
        ),
      },
    ]
      .filter((item) => {
        return item.value > 0;
      })
      .sort((a, b) => {
        return Math.sign(b.value - a.value);
      });
    return items.length > 0 ? <DonutChart items={items} /> : null;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringValueText
          label={
            <>
              <ItemSetLink id={EVOKER_T31_ID} /> (T31 tier set){' '}
            </>
          }
        >
          <>
            <h4>2 Piece</h4>
            <div>
              <TooltipElement
                content={
                  <>
                    {this.totalEbProcs} total{' '}
                    <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> procs
                    <br />
                    {this.wastedEb} wasted procs from refreshes
                  </>
                }
                hoverable
              >
                <div>
                  <ItemManaGained
                    amount={this.manaSaved}
                    approximate
                    useAbbrev
                    customLabel="mana"
                  />
                </div>
                <div>
                  <Soup /> {this.essenceSaved} <small>essence saved</small>
                </div>
              </TooltipElement>
              <div>
                <TooltipElement
                  content={
                    <>
                      <div>Total hits: {this.lfHealingHits}</div>
                      <div>Total healing: {formatNumber(this.lfHealing)}</div>
                    </>
                  }
                >
                  <ItemHealingDone amount={this.lfHealing} />
                </TooltipElement>
              </div>
            </div>
          </>
          <h4>4 piece</h4>
          <>
            <TooltipElement
              hoverable
              content={
                <>
                  {this.echoProcs} extra <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> buffs
                </>
              }
            >
              <ItemHealingDone amount={this.echoHealing} />
            </TooltipElement>
          </>
        </BoringValueText>
        <div className="pad">{this.renderDonutChart()}</div>
      </Statistic>
    );
  }
}

export default T31PrevokerSet;
