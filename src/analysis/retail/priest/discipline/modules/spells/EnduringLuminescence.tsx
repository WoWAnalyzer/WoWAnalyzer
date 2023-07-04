import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';

import { TALENTS_PRIEST } from 'common/TALENTS';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { POWER_WORD_RADIANCE_ATONEMENT_DUR } from '../../constants';

const ENDURING_LUMINESCENCE_BONUS_MS = 2250;
const EVANGELISM_BONUS_MS = 6000;

type RadAtonementEvents = AtonementAnalyzerEvent[];
type RadianceAtonement = {
  applyBuff: ApplyBuffEvent;
  atonementEvents: RadAtonementEvents;
  wasExtendedByEvangelismPreEnduringWindow: boolean;
  wasExtendedByEvangelismInEnduringWindow: boolean;
};

class EnduringLuminescense extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  _bonusFromAtonementDuration = 0;
  _bonusFromDirectHeal = 0;

  _rawBonusHealingPerHit = 0;

  _lastCastIsPowerWordRadiance = false;
  _atonementsAppliedByRadiances: RadianceAtonement[] = [];
  _lastRadianceCastTimestamp = 0; // Setting a dummy timestamp to 0

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.ENDURING_LUMINESCENCE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.EVANGELISM_TALENT),
      this.handleEvangelismCasts,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT),
      this.storePowerWordRadiancesCastTimestamp,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF),
      this.handleAtonementsApplications,
    );
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onAtonement);
  }

  storePowerWordRadiancesCastTimestamp(event: CastEvent) {
    this._lastRadianceCastTimestamp = event.timestamp;
  }

  onAtonement(event: AtonementAnalyzerEvent) {
    //Same situation as for Depth of the Shadows
    //Atonements in their Enduring window are fully counted since they would not be there otherwise
    this._atonementsAppliedByRadiances.forEach((atonement, index) => {
      const lowerBound =
        atonement.applyBuff.timestamp +
        (atonement.wasExtendedByEvangelismPreEnduringWindow ? EVANGELISM_BONUS_MS : 0) +
        POWER_WORD_RADIANCE_ATONEMENT_DUR;

      const upperBound =
        atonement.applyBuff.timestamp +
        (atonement.wasExtendedByEvangelismPreEnduringWindow ||
        atonement.wasExtendedByEvangelismInEnduringWindow
          ? EVANGELISM_BONUS_MS
          : 0) +
        POWER_WORD_RADIANCE_ATONEMENT_DUR +
        ENDURING_LUMINESCENCE_BONUS_MS;

      if (
        event.targetID === atonement.applyBuff.targetID &&
        event.timestamp > lowerBound &&
        event.timestamp < upperBound
      ) {
        this._bonusFromAtonementDuration += event.healEvent.amount;
        this._atonementsAppliedByRadiances[index].atonementEvents.push(event);
      }
    });
  }

  handleEvangelismCasts(event: CastEvent) {
    this._atonementsAppliedByRadiances.forEach((atonement, index) => {
      //Atonements in their normal duration window when Evangelism is cast
      if (
        event.timestamp > atonement.applyBuff.timestamp &&
        event.timestamp < atonement.applyBuff.timestamp + POWER_WORD_RADIANCE_ATONEMENT_DUR
      ) {
        this._atonementsAppliedByRadiances[index].wasExtendedByEvangelismPreEnduringWindow = true;
      }
      //Atonements in their Enduring Luminescence duration window when Evangelism is cast
      if (
        event.timestamp > atonement.applyBuff.timestamp + POWER_WORD_RADIANCE_ATONEMENT_DUR &&
        event.timestamp <
          atonement.applyBuff.timestamp +
            POWER_WORD_RADIANCE_ATONEMENT_DUR +
            ENDURING_LUMINESCENCE_BONUS_MS
      ) {
        this._atonementsAppliedByRadiances[index].wasExtendedByEvangelismInEnduringWindow = true;
      }
    });
  }

  handleAtonementsApplications(event: ApplyBuffEvent) {
    if (event.timestamp !== this._lastRadianceCastTimestamp) {
      return;
    }

    this._atonementsAppliedByRadiances.push({
      applyBuff: event,
      atonementEvents: [],
      wasExtendedByEvangelismPreEnduringWindow: false,
      wasExtendedByEvangelismInEnduringWindow: false,
    });
  }

  statistic() {
    const total = this._bonusFromAtonementDuration + this._bonusFromDirectHeal;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.ENDURING_LUMINESCENCE_TALENT}>
          <ItemHealingDone amount={total} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EnduringLuminescense;
