import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';

const TORRENT_HEALING_INCREASE = 0.1;

class Torrent extends Analyzer {
  healing = 0;
  overHealing = 0;
  torrentIncrease = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TORRENT_TALENT);
    this.torrentIncrease =
      TORRENT_HEALING_INCREASE * this.selectedCombatant.getTalentRank(TALENTS.TORRENT_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this._onHeal,
    );
  }

  _onHeal(event: HealEvent) {
    if (event.tick) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, this.torrentIncrease);
    this.overHealing += calculateOverhealing(event, this.torrentIncrease);
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
