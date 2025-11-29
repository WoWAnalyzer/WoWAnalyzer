import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import HotTrackerMW from '../core/HotTrackerMW';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, HealEvent } from 'parser/core/Events';
import { TALENTS_MONK } from 'common/TALENTS';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { isFromTFT } from '../../normalizers/EventLinks/TierEventLinks';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { MONK_MID1_ID } from 'common/ITEMS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';

const TWO_PIECE_INCREASE = 0.2;

class S1TierSet extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
  };

  twoPieceHealing = 0;
  fourPieceHealing = 0;
  additionalRems = 0;
  hasFourPiece = false;
  additionalInvigoratingMistHits = 0;
  additionalZenPulseHits = 0;
  additionalTearOfMorningProcs = 0;
  additionalMistyPeaksProcs = 0;
  protected hotTracker!: HotTrackerMW;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID1);
    this.hasFourPiece = this.selectedCombatant.has4PieceByTier(TIERS.MID1);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemHeal,
    );
    if (this.hasFourPiece) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
        this.onRemApply,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
        this.onEnvHeal,
      );
      this.addEventListener(
        Events.heal
          .by(SELECTED_PLAYER)
          .spell([SPELLS.ZEN_PULSE_HEAL, SPELLS.INVIGORATING_MISTS_HEAL]),
        this.onVivifyOrZenPulse,
      );
    }
  }

  onVivifyOrZenPulse(event: HealEvent) {
    const fourPieceRem = this.hotTracker.getHot(event, SPELLS.RENEWING_MIST_HEAL.id);
    if (!fourPieceRem || !this.hotTracker.fromThunderFocusTea(fourPieceRem)) return;
    this.fourPieceHealing += event.amount + (event.absorbed || 0);
    if (event.ability.guid === SPELLS.ZEN_PULSE_HEAL.id) {
      this.additionalZenPulseHits += 1;
    } else {
      this.additionalInvigoratingMistHits += 1;
    }
  }

  onEnvHeal(event: HealEvent) {
    const fourPieceRem = this.hotTracker.getHot(event, SPELLS.RENEWING_MIST_HEAL.id);
    if (!fourPieceRem || !this.hotTracker.fromThunderFocusTea(fourPieceRem)) return;
    //tom proc on 4pc rem
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.TEAR_OF_MORNING_TALENT) && !event.tick) {
      this.fourPieceHealing += event.amount + (event.absorbed || 0);
      this.additionalTearOfMorningProcs += 1;
    }
    //misty peak proc on 4pc rem
    const hot = this.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (hot && this.hotTracker.fromMistyPeaks(hot)) {
      this.fourPieceHealing += event.amount + (event.absorbed || 0);
      this.additionalMistyPeaksProcs += 1;
    }
  }

  onRemHeal(event: HealEvent) {
    this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_INCREASE);
    if (!this.hasFourPiece) return;
    const spellId = event.ability.guid;

    const hot = this.hotTracker.getHot(event, spellId);
    if (!hot) return;

    if (this.hotTracker.fromThunderFocusTea(hot)) {
      this.fourPieceHealing += event.amount + (event.absorbed || 0);
    }
  }

  onRemApply(event: ApplyBuffEvent) {
    if (isFromTFT(event)) {
      this.additionalRems += 1;
    }
  }

  get totalHealing() {
    return this.twoPieceHealing + this.fourPieceHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <strong>2pc Piece Healing: {formatNumber(this.twoPieceHealing)} </strong>
            <br />
            {this.hasFourPiece && (
              <>
                <strong>4pc Healing: {formatNumber(this.fourPieceHealing)}</strong> <br />
                <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} /> applied from 4pc:{' '}
                {this.additionalRems} <br />
                <SpellLink spell={SPELLS.INVIGORATING_MISTS_HEAL} /> hits from 4pc:{' '}
                {this.additionalInvigoratingMistHits} <br />
                {this.selectedCombatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT) && (
                  <>
                    <SpellLink spell={SPELLS.ZEN_PULSE_HEAL} /> hits from 4pc:{' '}
                    {this.additionalZenPulseHits} <br />
                  </>
                )}
                {this.selectedCombatant.hasTalent(TALENTS_MONK.TEAR_OF_MORNING_TALENT) && (
                  <>
                    <SpellLink spell={TALENTS_MONK.TEAR_OF_MORNING_TALENT} /> hits from 4pc rems:{' '}
                    {this.additionalTearOfMorningProcs} <br />
                  </>
                )}
                {this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT) && (
                  <>
                    <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} /> procs from 4pc rems:{' '}
                    {this.additionalMistyPeaksProcs} <br />
                  </>
                )}
              </>
            )}
          </>
        }
      >
        <BoringItemSetValueText setId={MONK_MID1_ID} title="Mistweaver Season 1 Tier Set">
          2pc: <br />
          <ItemHealingDone amount={this.twoPieceHealing} />
          {this.hasFourPiece && (
            <>
              <hr />
              4pc:
              <br />
              <ItemHealingDone amount={this.fourPieceHealing} />
            </>
          )}
        </BoringItemSetValueText>
      </Statistic>
    );
  }
}

export default S1TierSet;
