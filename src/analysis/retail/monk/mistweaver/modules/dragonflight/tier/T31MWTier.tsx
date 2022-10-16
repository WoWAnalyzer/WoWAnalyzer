import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Events, { HealEvent, ApplyBuffEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import HotTracker from 'parser/shared/modules/HotTracker';
import HotTrackerMW from '../../core/HotTrackerMW';
import {
  TWO_PIECE_BONUS,
  FOUR_PIECE_BONUS,
  FOUR_PIECE_EXTENSION,
  RISING_MIST_EXTENSION,
} from '../../../constants';

const TWO_PIECE_SPELLS = [
  TALENTS_MONK.ESSENCE_FONT_TALENT,
  SPELLS.ESSENCE_FONT_BUFF,
  SPELLS.FAELINE_STOMP_ESSENCE_FONT,
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  SPELLS.VIVIFY,
];
const FOUR_PIECE_SPELLS = [
  TALENTS_MONK.ESSENCE_FONT_TALENT,
  SPELLS.ESSENCE_FONT_BUFF,
  SPELLS.VIVIFY,
];
class T31TierSet extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
  };
  hotTracker!: HotTrackerMW;
  has2Piece: boolean = true;
  has4Piece: boolean = true;
  numExtensions: number = 0;
  twoPieceHealing: number = 0;
  fourPieceHealing: number = 0;
  extraVivCleaves = 0;
  extraVivHealing = 0;
  extraVivOverhealing = 0;
  extraVivAbsorbed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.has2Piece || this.has4Piece;
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
    }
  }

  handleEfBolt(event: ApplyBuffEvent) {
    const playerId = event.targetID;
    const spellId = event.ability.guid;
    if (
      spellId !== SPELLS.ESSENCE_FONT_BUFF.id &&
      spellId !== SPELLS.FAELINE_STOMP_ESSENCE_FONT.id
    ) {
      return;
    }
    if (
      !this.hotTracker.hots[playerId] ||
      !this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id]
    ) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][SPELLS.RENEWING_MIST_HEAL.id];
    const attribution = HotTracker.getNewAttribution(`4 Piece extension #${this.numExtensions}`);
    this.hotTracker.addExtension(
      attribution,
      FOUR_PIECE_EXTENSION,
      playerId,
      hot.spellId,
      event.timestamp,
    );
    this.numExtensions += 1;
  }

  handle2PcHeal(event: HealEvent) {
    this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_BONUS);
  }

  handle4PcHeal(event: HealEvent) {
    this.fourPieceHealing += calculateEffectiveHealing(event, FOUR_PIECE_BONUS);
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
    const numRMExtensions = this.hotTracker.getNumberOfExtensions(hot.extensions, 'RisingMist');
    if (event.timestamp > hot.originalEnd + numRMExtensions * RISING_MIST_EXTENSION) {
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
      this.extraVivAbsorbed += event.absorbed || 0;
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
            <li>{this.numExtensions} 4 pc extensions</li>
            <li>{this.extraVivCleaves} extra Vivify cleaves from extensions</li>
            <li>{formatNumber(this.extraVivOverhealing)} extra Vivify overhealing</li>
            <li>{formatNumber(this.extraVivAbsorbed)} extra Vivify healing absorbed</li>
          </ul>
        }
      >
        <BoringValueText label="T29 Tier Set">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.twoPieceHealing} />
          {this.has4Piece && (
            <>
              <h4>4 Piece</h4>
              <ItemHealingDone amount={this.fourPieceHealing} />
              <br />
              <small> Extra Vivify Healing from extensions</small>
              <br />
              <ItemHealingDone amount={this.extraVivHealing} />
            </>
          )}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T31TierSet;
