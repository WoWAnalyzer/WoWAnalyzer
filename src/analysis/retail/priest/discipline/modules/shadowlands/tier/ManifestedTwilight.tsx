import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SHADOW_MEND_ATONEMENT_DUR } from '../../../constants';
import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';
// import CombatLogParser from 'parser/core/CombatLogParser';
// import SpellIcon from 'interface/SpellIcon';
const MANIFESTED_TWILIGHT_BONUS_MS = 2000;
const EVANG_EXTENSION_DURATION = 6000;
type SmendInfo = {
  cast: CastEvent;
  extendedByEvangIn2P?: boolean;
  extendedByEvangPre2P?: boolean;
};

class ManifestedTwilight extends Analyzer {
  twoPieceShadowMends = 0;
  shadowMendCasts: SmendInfo[] = [];
  manaSaved = 0;
  atonementHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2Piece();

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.spell(SPELLS.SHADOW_MEND).by(SELECTED_PLAYER),
      this.onShadowMend,
    );

    this.addEventListener(
      Events.cast.spell(TALENTS_PRIEST.EVANGELISM_DISCIPLINE_TALENT).by(SELECTED_PLAYER),
      this.onEvang,
    );

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
  }

  onShadowMend(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MANIFESTED_TWILIGHT_BUFF_2P.id)) {
      this.twoPieceShadowMends += 1;
      this.shadowMendCasts.push({ cast: event });
      this.manaSaved += SPELLS.SHADOW_MEND.manaCost;
    }
  }

  onEvang(event: CastEvent) {
    this.shadowMendCasts.forEach((shadowMend, index: number) => {
      if (
        event.timestamp > shadowMend.cast.timestamp &&
        event.timestamp < shadowMend.cast.timestamp + SHADOW_MEND_ATONEMENT_DUR
      ) {
        this.shadowMendCasts[index].extendedByEvangPre2P = true;
      }

      // `SPELLS.SHADOW_MEND.atonementDuration` doesn't exist anymore
      // but Wowhead mentions Atonement being applied by Shadow Mend to be 15s
      if (
        event.timestamp > shadowMend.cast.timestamp + SHADOW_MEND_ATONEMENT_DUR &&
        event.timestamp <
          shadowMend.cast.timestamp + SHADOW_MEND_ATONEMENT_DUR + MANIFESTED_TWILIGHT_BONUS_MS
      ) {
        this.shadowMendCasts[index].extendedByEvangIn2P = true;
      }
    });
  }

  handleAtone(event: AtonementAnalyzerEvent) {
    this.shadowMendCasts.forEach((shadowMend) => {
      const end =
        shadowMend.cast.timestamp +
        (shadowMend.extendedByEvangPre2P ? EVANG_EXTENSION_DURATION : 0) +
        SHADOW_MEND_ATONEMENT_DUR +
        MANIFESTED_TWILIGHT_BONUS_MS;
      const start =
        shadowMend.cast.timestamp +
        (shadowMend.extendedByEvangPre2P ? EVANG_EXTENSION_DURATION : 0) +
        SHADOW_MEND_ATONEMENT_DUR;

      if (
        event.targetID === shadowMend.cast.targetID &&
        event.timestamp > start &&
        event.timestamp < end
      ) {
        this.atonementHealing += event.healEvent.amount;
      }
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={<>{this.shadowMendCasts.length} casts were free</>}
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={SPELLS.MANIFESTED_TWILIGHT_BUFF_2P.id} />
            </>
          }
        >
          <>
            <ItemManaGained amount={this.manaSaved} />
            <ItemHealingDone amount={this.atonementHealing} />
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ManifestedTwilight;
