import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

const TORRENT_HEALING_INCREASE = 0.2;

class Torrent extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TORRENT_TALENT);

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
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS.TORRENT_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }
}

export default Torrent;
