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
import { TIERS } from 'game/TIERS';
import ItemManaGained from 'parser/ui/ItemManaGained';

const RADIANT_PROVIDENCE_EXTENSION = 3000;
const EVANGELISM_BONUS_MS = 6000;
const RADIANT_PROVIDENCE_MANA_REDUCTION = SPELLS.POWER_WORD_RADIANCE.manaCost * 0.5;

type RadAtonementEvents = AtonementAnalyzerEvent[];
type RadianceAtonement = {
  applyBuff: ApplyBuffEvent;
  atonementEvents: RadAtonementEvents;
  wasExtendedByEvangelismPre4pWindow: boolean;
  wasExtendedByEvangelismIn4pWindow: boolean;
};

class RadiantProvidence extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  _bonusFromAtonementDuration = 0;

  _rawBonusHealingPerHit = 0;
  _manaSaved = 0;
  _atonementsAppliedByRadiances: RadianceAtonement[] = [];
  _lastRadianceCastTimestamp = 0; // Setting a dummy timestamp to 0

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.DF2);

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
    if (this.selectedCombatant.hasBuff(SPELLS.RADIANT_PROVIDENCE_BUFF.id)) {
      this._manaSaved += RADIANT_PROVIDENCE_MANA_REDUCTION;
    }
    this._lastRadianceCastTimestamp = event.timestamp;
  }

  onAtonement(event: AtonementAnalyzerEvent) {
    //Same situation as for Depth of the Shadows
    //Atonements in their 4p window are fully counted since they would not be there otherwise
    this._atonementsAppliedByRadiances.forEach((atonement, index) => {
      const lowerBound =
        atonement.applyBuff.timestamp +
        (atonement.wasExtendedByEvangelismPre4pWindow ? EVANGELISM_BONUS_MS : 0) +
        POWER_WORD_RADIANCE_ATONEMENT_DUR;

      const upperBound =
        atonement.applyBuff.timestamp +
        (atonement.wasExtendedByEvangelismPre4pWindow || atonement.wasExtendedByEvangelismIn4pWindow
          ? EVANGELISM_BONUS_MS
          : 0) +
        POWER_WORD_RADIANCE_ATONEMENT_DUR +
        RADIANT_PROVIDENCE_EXTENSION;

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
        this._atonementsAppliedByRadiances[index].wasExtendedByEvangelismPre4pWindow = true;
      }
      //Atonements in their 4p duration window when Evangelism is cast
      if (
        event.timestamp > atonement.applyBuff.timestamp + POWER_WORD_RADIANCE_ATONEMENT_DUR &&
        event.timestamp <
          atonement.applyBuff.timestamp +
            POWER_WORD_RADIANCE_ATONEMENT_DUR +
            RADIANT_PROVIDENCE_EXTENSION
      ) {
        this._atonementsAppliedByRadiances[index].wasExtendedByEvangelismIn4pWindow = true;
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
      wasExtendedByEvangelismPre4pWindow: false,
      wasExtendedByEvangelismIn4pWindow: false,
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.RADIANT_PROVIDENCE_BUFF}>
          (Aberrus 4p)
          <br />
          <ItemHealingDone amount={this._bonusFromAtonementDuration} />
          <br /> <ItemManaGained amount={this._manaSaved} useAbbrev />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RadiantProvidence;
