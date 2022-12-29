import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Demon Bolt has a chance to make your next Hand of Gul'dan instant and deal 150% increased damage.
 */

class DemonologyWarlockVaultOfTheIncarnates4Set extends Analyzer {
  applications: number = 0;
  wastedApplications: number = 0;

  isBuffActive: boolean = false;

  demonboltCasts: number = 0;
  demonboltCastsWithBuffActive: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T29);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLAZING_METEOR),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLAZING_METEOR),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLAZING_METEOR),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onDemonboltCast,
    );
  }

  onApplyBuff() {
    this.applications += 1;
    this.isBuffActive = true;
  }

  onRefreshBuff() {
    this.wastedApplications += 1;
  }

  onRemoveBuff() {
    this.isBuffActive = false;
  }

  onDemonboltCast() {
    this.demonboltCasts += 1;
    if (this.isBuffActive) {
      this.demonboltCastsWithBuffActive += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Four piece tier set bonus
            <br />
            Demon Bolt has a chance to make your next Hand of Gul&apos;dan instant and deal 150%
            increased damage.
          </>
        }
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.BLAZING_METEOR.id}>
          {this.applications}{' '}
          <small>
            effective proc(s) (
            {formatPercentage((this.applications + this.wastedApplications) / this.demonboltCasts)}%
            demonbolt cast(s) procced)
          </small>
          <br />
          <small>
            You cast demonbolt {this.demonboltCastsWithBuffActive} time(s) while the buff was
            active, resulting in{' '}
          </small>
          {this.wastedApplications} <small>wasted proc(s)</small>
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DemonologyWarlockVaultOfTheIncarnates4Set;
