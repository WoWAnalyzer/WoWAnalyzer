import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const FOUR_PIECE_BONUS = 0.4;
const TWO_PIECE_BONUS = 0.12;
const FOUR_PIECE_SPELLS = [SPELLS.RENEWING_MIST_HEAL, SPELLS.VIVIFY];
const TWO_PIECE_SPELLS = [
  SPELLS.RENEWING_MIST_HEAL,
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  TALENTS_MONK.SOOTHING_MIST_TALENT,
  SPELLS.UNISON_HEAL,
  SPELLS.ENVELOPING_MIST_TFT,
  SPELLS.ENVELOPING_BREATH_HEAL,
];

class T30TierSet extends Analyzer {
  has2Piece: boolean = true;
  has4Piece: boolean = true;
  vivHealing: number = 0;
  renewingMistHealing: number = 0;
  twoPieceHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.T30);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T30) && this.has2Piece;
    this.active = this.has2Piece;
    if (!this.active) {
      return;
    }
    // 2pc reworked to increase soothing mist renewing mist and enveloping mist by 12%

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TWO_PIECE_SPELLS),
      this.handle2pcHeal,
    );
    //4pc do uptime and effective healing increase
    if (this.has4Piece) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(FOUR_PIECE_SPELLS),
        this.handle4PcHeal,
      );
    }
  }

  get total4PieceHealing() {
    return this.renewingMistHealing + this.vivHealing;
  }

  get fourSetUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.SOULFANG_VITALITY.id) / this.owner.fightDuration
    );
  }

  handle2pcHeal(event: HealEvent) {
    this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_BONUS);
  }

  handle4PcHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (this.selectedCombatant.hasBuff(SPELLS.SOULFANG_VITALITY.id)) {
      const healing = calculateEffectiveHealing(event, FOUR_PIECE_BONUS);
      spellId === SPELLS.RENEWING_MIST_HEAL.id
        ? (this.renewingMistHealing += healing)
        : (this.vivHealing += healing);
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
              <strong>{formatNumber(this.renewingMistHealing)}</strong> extra{' '}
              <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} /> healing
            </li>
            <li>
              <strong>{formatNumber(this.vivHealing)}</strong> extra{' '}
              <SpellLink spell={SPELLS.VIVIFY} /> healing
            </li>
          </ul>
        }
      >
        <BoringValueText label="Fangs of Forged Vermillion (T30 Set Bonus)">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.twoPieceHealing} />
          <hr />
          {this.has4Piece && (
            <>
              <h4>4 Piece</h4>
              <ItemHealingDone amount={this.total4PieceHealing} />
              <br />
              {formatPercentage(this.fourSetUptime)}%<small> uptime</small>
            </>
          )}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T30TierSet;
