import ITEMS from 'common/ITEMS/evoker';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
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
  isEbFromT30Tier,
} from '../../../normalizers/CastLinkNormalizer';
import { ESSENCE_COSTS } from '../../talents/EssenceBurst';
import { MANA_COSTS } from '../../talents/EssenceBurst';
import Soup from 'interface/icons/Soup';
import { SpellLink, TooltipElement } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { formatNumber } from 'common/format';

const TWO_PIECE_INC = 0.15;

class T30PrevokerSet extends Analyzer {
  has4Piece: boolean = false;
  hotHealing: number = 0;
  hotOverhealing: number = 0;
  dbIncHealing: number = 0;
  dbIncOverhealing: number = 0;
  manaSaved: number = 0;
  essenceSaved: number = 0;
  wastedProcs: number = 0; // from EB buff refreshes
  total4SetProcs: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    if (!this.active) {
      return;
    }
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T30);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH, SPELLS.DREAM_BREATH_ECHO]),
      this.onDbHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(ITEMS.T30_SPIRITBLOOM_HOT),
      this.on2pcHotHeal,
    );
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
  }

  on2pcHotHeal(event: HealEvent) {
    this.hotHealing += event.amount;
    this.hotOverhealing += event.overheal || 0;
  }

  onDbHeal(event: HealEvent) {
    this.dbIncHealing += calculateEffectiveHealing(event, TWO_PIECE_INC);
    this.dbIncOverhealing += calculateOverhealing(event, TWO_PIECE_INC);
  }

  onEbProc(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (!isEbFromT30Tier(event)) {
      return;
    }

    const castEvent = getEssenceBurstConsumeAbility(event);
    if (!castEvent) {
      return;
    }
    this.total4SetProcs += 1;
    this.essenceSaved += ESSENCE_COSTS[castEvent.ability.name];
    this.manaSaved += MANA_COSTS[castEvent.ability.name];
  }

  onEbRefresh(event: RefreshBuffEvent) {
    if (!isEbFromT30Tier(event)) {
      return;
    }
    this.wastedProcs += 1;
  }

  get totalHealing() {
    return this.dbIncHealing + this.hotHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringValueText label="Legacy of Obsidian Secrets (T30 Set Bonus)">
          <TooltipElement
            hoverable
            content={
              <>
                <SpellLink spell={ITEMS.T30_SPIRITBLOOM_HOT} /> HoT healing:{' '}
                {formatNumber(this.hotHealing)}
                {' (' + formatNumber(this.hotOverhealing) + ' overhealing)'}
                <br />
                Healing from <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> increase:{' '}
                {formatNumber(this.dbIncHealing)}
                {' (' + formatNumber(this.dbIncOverhealing) + ' overhealing)'}
                <br />
              </>
            }
          >
            <h4>2 Piece</h4>
          </TooltipElement>
          <ItemHealingDone amount={this.totalHealing} /> <br />
          {this.has4Piece && (
            <>
              <TooltipElement
                content={
                  <>
                    {this.total4SetProcs} total{' '}
                    <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> procs
                    <br />
                    {this.wastedProcs} wasted procs from refreshes
                  </>
                }
                hoverable
              >
                <h4>4 Piece</h4>
              </TooltipElement>
              <ItemManaGained amount={this.manaSaved} approximate useAbbrev customLabel="mana" />
              <br />
              <Soup /> {this.essenceSaved} <small>essence saved</small>
            </>
          )}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T30PrevokerSet;
