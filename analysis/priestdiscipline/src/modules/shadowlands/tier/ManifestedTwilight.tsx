import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// import CombatLogParser from 'parser/core/CombatLogParser';
import { SHADOW_MEND_ATONEMENT_DUR } from '../../../constants';
// import SpellIcon from 'interface/SpellIcon';
const MANIFESTED_TWILIGHT_BONUS_MS = 2000;
// const AFTER_CAST_BUFFER_MS = 200
type SmendInfo = {
  cast: CastEvent;
  extendedByEvangIn2P?: boolean;
  extendedByEvangPre2P?: boolean;
};

class ManifestedTwilight extends Analyzer {
  twoPieceShadowMends = 0;
  shadowMendCasts: SmendInfo[] = [];
  manaSaved = 0;
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
      Events.cast.spell(SPELLS.EVANGELISM_TALENT).by(SELECTED_PLAYER),
      this.onEvang,
    );
  }

  onShadowMend(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MANIFESTED_TWILIGHT_BUFF_2P.id)) {
      this.twoPieceShadowMends += 1;

      // @param {number} spellId - buff ID to check for
      // * @param {number} forTimestamp Timestamp (in ms) to be considered, or the current timestamp if null. Won't work right for timestamps after the currentTimestamp.
      // * @param {number} bufferTime Time (in ms) after buff's expiration where it will still be included. There's a bug in the combat log where if a spell consumes a buff that buff may disappear a short time before the heal or damage event it's buffing is logged. This can sometimes go up to hundreds of milliseconds.
      // * @param {number} minimalActiveTime - Time (in ms) the buff must have been active before timestamp for it to be included.
      // * @param {number} sourceID - source ID the buff must have come from, or any source if null.
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

      if (
        event.timestamp > shadowMend.cast.timestamp + SPELLS.SHADOW_MEND.atonementDuration &&
        event.timestamp <
          shadowMend.cast.timestamp +
            SPELLS.SHADOW_MEND.atonementDuration +
            MANIFESTED_TWILIGHT_BONUS_MS
      ) {
        this.shadowMendCasts[index].extendedByEvangIn2P = true;
      }
    });
  }

  statistic() {
    console.log(this.shadowMendCasts);
    const mendCasts = this.shadowMendCasts.map((smend) =>
      this.owner.formatTimestamp(smend.cast.timestamp),
    );
    console.log(mendCasts);
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
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ManifestedTwilight;
