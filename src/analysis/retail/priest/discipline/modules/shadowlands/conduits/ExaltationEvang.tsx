import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import conduitScaling from 'parser/core/conduitScaling';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, AbsorbedEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const EXALTATION_RANK_ONE = 5;
const RAPTURE_DURATION_MS = 8000;
const EXALTATION_EXTENSION_MS = 1000;

type ShieldCastsInfo = {
  cast: CastEvent;
  fromExaltationExtension?: boolean;
};

class ExaltationEvang extends Analyzer {
  lastRapture?: CastEvent;
  conduitRank: number = 0;
  conduitIncrease: number = 0;
  bonusExaltationHealing: number = 0;
  bonusRaptureCasts = 0;
  shieldCasts: ShieldCastsInfo[] = [];

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.EXALTATION.id);

    if (!this.conduitRank || !this.selectedCombatant.hasTalent(SPELLS.EVANGELISM_TALENT)) {
      this.active = false;
      return;
    }
    this.conduitIncrease = conduitScaling(EXALTATION_RANK_ONE, this.conduitRank);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.POWER_WORD_SHIELD, SPELLS.RAPTURE]),
      this.checkRapture,
    );
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onHeal);
  }

  checkRapture(event: CastEvent) {
    if (event.ability.guid === SPELLS.RAPTURE.id) {
      this.lastRapture = event;
    }

    // shields resulting from the extension
    if (
      this.lastRapture &&
      event.timestamp > this.lastRapture?.timestamp + RAPTURE_DURATION_MS &&
      event.timestamp < this.lastRapture.timestamp + RAPTURE_DURATION_MS + EXALTATION_EXTENSION_MS
    ) {
      this.shieldCasts.push({ cast: event, fromExaltationExtension: true });
    } else if (
      this.lastRapture &&
      event.timestamp < this.lastRapture?.timestamp + RAPTURE_DURATION_MS &&
      event.timestamp > this.lastRapture.timestamp
    ) {
      this.shieldCasts.push({ cast: event });
    }
  }

  onHeal(event: AbsorbedEvent) {
    if (event.ability.guid !== SPELLS.POWER_WORD_SHIELD.id) {
      return;
    }
    this.shieldCasts.forEach((shield) => {
      if (
        this.lastRapture &&
        event.targetID === shield.cast.targetID &&
        event.timestamp > this.lastRapture?.timestamp &&
        event.timestamp < this.lastRapture.timestamp + RAPTURE_DURATION_MS + EXALTATION_EXTENSION_MS
      ) {
        this.bonusExaltationHealing += calculateEffectiveHealing(event, this.conduitIncrease / 100);
      }
    });
  }

  statistic() {
    this.bonusRaptureCasts = this.shieldCasts.filter((cast) => cast.fromExaltationExtension).length;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.EXALTATION.id} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.bonusExaltationHealing} />
            <br />
            <div>Bonus casts: {this.bonusRaptureCasts}</div>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default ExaltationEvang;
