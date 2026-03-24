import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import StatTracker from 'parser/shared/modules/StatTracker';

const TORRENT_HEALING_INCREASE = 0.2;
const TORRENT_CRIT_INCREASE = 0.1;

class Torrent extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  healing = 0;
  overHealing = 0;

  critMult = 2;
  critIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TORRENT_TALENT);
    if (!this.active) {
      return;
    }
    this.critMult = this.selectedCombatant.hasTalent(TALENTS.WHITE_WATER_TALENT) ? 2.15 : 2;

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this._onHeal,
    );
  }

  _onHeal(event: HealEvent) {
    if (event.tick) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, TORRENT_HEALING_INCREASE);
    this.overHealing += calculateOverhealing(event, TORRENT_HEALING_INCREASE);

    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    const raw = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    const healingIncrease = raw - raw / this.critMult;
    const effectiveHealing = healingIncrease - (event.overheal || 0);
    const effectiveCritHit = Math.max(0, effectiveHealing);
    this.critIncrease +=
      (effectiveCritHit * TORRENT_CRIT_INCREASE) /
      (this.statTracker.currentCritPercentage + TORRENT_CRIT_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healing)}</strong> bonus healing (
            {formatNumber(this.overHealing)} overhealing)
            <br />
            <strong>{formatNumber(this.critIncrease)}</strong> estimated bonus healing from the
            increased critical strike chance. This is not included in the HPS value below.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.TORRENT_TALENT}>
          <div>
            <ItemHealingDone amount={this.healing} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Torrent;
