import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
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
import { ECHO_HEALS } from '../../../constants';

class T31PrevokerSet extends Analyzer {
  static dependencies = { echo: Echo };
  has4Piece: boolean = false;
  manaSaved: number = 0;
  essenceSaved: number = 0;
  wastedEb: number = 0; // from EB buff refreshes
  totalEbProcs: number = 0;
  lfHealingHits: number = 0;
  lfHealing: number = 0;
  echoProcs: number = 0;
  echoHealing: number = 0;
  protected echo!: Echo;

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
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ECHO_TALENT),
      this.onEchoApply,
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
    if (!isEchoFromT314PC(event)) {
      return;
    }
    this.echoHealing += event.amount + (event.absorbed || 0);
  }

  onEchoApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!isEchoFromT314PC(event)) {
      return;
    }
    this.echoProcs += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringValueText label="T31 Set Bonus">
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
      </Statistic>
    );
  }
}

export default T31PrevokerSet;
