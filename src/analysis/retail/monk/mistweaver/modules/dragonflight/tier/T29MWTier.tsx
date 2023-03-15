import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import Events, { HealEvent, ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import HotTracker from 'parser/shared/modules/HotTracker';
import HotTrackerMW from '../../core/HotTrackerMW';
import SpellLink from 'interface/SpellLink';

const TWO_PIECE_BONUS = 0.1;
const FOUR_PIECE_BONUS = 0.1;
const FOUR_PIECE_EXTENSION = 1000;
const ATTRIBUTION_PREFIX = '4 Piece extension';

const TWO_PIECE_SPELLS = [
  SPELLS.ESSENCE_FONT_BUFF,
  SPELLS.FAELINE_STOMP_ESSENCE_FONT,
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  SPELLS.VIVIFY,
];

const FOUR_PIECE_SPELLS = [
  SPELLS.FAELINE_STOMP_ESSENCE_FONT,
  SPELLS.ESSENCE_FONT_BUFF,
  SPELLS.VIVIFY,
];

const EXTENSION_ATTRIB = HotTracker.getNewAttribution(ATTRIBUTION_PREFIX);

class T29TierSet extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
  };
  hotTracker!: HotTrackerMW;
  has2Piece: boolean = true;
  has4Piece: boolean = true;
  numExtensions: number = 0;
  totalExtensionDuration: number = 0;
  twoPieceHealing: number = 0;
  fourPieceHealingFromBuff: number = 0;
  extraRemHealing: number = 0;
  extraVivHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.T29);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T29) && this.has2Piece;
    this.active = this.has2Piece;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ESSENCE_FONT_BUFF, SPELLS.FAELINE_STOMP_ESSENCE_FONT]),
      this.handleEfBolt,
    );
    this.addEventListener(
      Events.refreshbuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ESSENCE_FONT_BUFF, SPELLS.FAELINE_STOMP_ESSENCE_FONT]),
      this.handleEfBolt,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TWO_PIECE_SPELLS),
      this.handle2PcHeal,
    );
    if (this.has4Piece) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(FOUR_PIECE_SPELLS),
        this.handle4PcHeal,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY),
        this.handle4PcVivify,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
        this.handleRemTick,
      );
    }
  }

  get total4PieceHealing() {
    return this.fourPieceHealingFromBuff + this.extraRemHealing + this.extraVivHealing;
  }

  handleEfBolt(event: ApplyBuffEvent | RefreshBuffEvent) {
    const playerId = event.targetID;
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id].maxDuration! +=
      FOUR_PIECE_EXTENSION;
    this.hotTracker.addExtension(
      EXTENSION_ATTRIB,
      FOUR_PIECE_EXTENSION,
      playerId,
      SPELLS.RENEWING_MIST_HEAL.id,
      event.timestamp,
    );

    this.numExtensions += 1;
    this.totalExtensionDuration +=
      this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id].extensions.at(-1)!.amount;
  }

  handle2PcHeal(event: HealEvent) {
    if (
      !this.hotTracker.hots[event.targetID] ||
      !this.hotTracker.hots[event.targetID][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_BONUS);
  }

  handle4PcHeal(event: HealEvent) {
    this.fourPieceHealingFromBuff += calculateEffectiveHealing(event, FOUR_PIECE_BONUS);
  }

  handle4PcVivify(event: HealEvent) {
    const targetId = event.targetID;
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    const extensionForVivify = this.hotTracker.getRemExtensionForTimestamp(hot, event.timestamp);
    if (extensionForVivify?.attribution.name.startsWith(ATTRIBUTION_PREFIX)) {
      this.extraVivHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  handleRemTick(event: HealEvent) {
    const targetId = event.targetID;
    if (
      !this.hotTracker.hots[targetId] ||
      !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    const extension = this.hotTracker.getRemExtensionForTimestamp(hot, event.timestamp);
    if (extension?.attribution.name.startsWith(ATTRIBUTION_PREFIX)) {
      this.extraRemHealing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <ul>
            <li>
              {formatDuration(this.totalExtensionDuration)} extra seconds of{' '}
              <SpellLink id={SPELLS.RENEWING_MIST_HEAL.id} />
            </li>
            <li>
              {formatNumber(this.extraVivHealing)} extra <SpellLink id={SPELLS.VIVIFY.id} /> healing
              from extensions
            </li>
            <li>
              {formatNumber(this.extraRemHealing)} extra{' '}
              <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> healing from extensions
            </li>
          </ul>
        }
      >
        <BoringValueText label="T29 Tier Set">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.twoPieceHealing} />
          {this.has4Piece && (
            <>
              <h4>4 Piece</h4>
              <ItemHealingDone amount={this.total4PieceHealing} />
            </>
          )}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T29TierSet;
