import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class TornadoTrigger extends Analyzer {
  bteProcCount: number = 0;
  bulletsLoadedCount: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4Piece();

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PISTOL_SHOT), this.onCast);
  }

  onCast() {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.OUTLAW_ROGUE_TIER_28_4P_SET_BONUS_6SHOT.id) &&
      this.selectedCombatant.hasBuff(SPELLS.OUTLAW_ROGUE_TIER_28_4P_SET_BONUS_LOAD_BULLET.id)
    ) {
      this.bulletsLoadedCount += 1;
      return;
    }
    this.bteProcCount += 1;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.OUTLAW_ROGUE_TIER_28_4P_SET_BONUS_LOAD_BULLET.id}>
          {this.bulletsLoadedCount}
          <small> Total amount of bullets loaded</small>
        </BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.OUTLAW_ROGUE_TIER_28_4P_SET_BONUS_6SHOT.id}>
          {this.bteProcCount}
          <small> Total 4 piece buff procs consumed</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TornadoTrigger;
