import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { formatNumber, formatPercentage } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import { DamageIcon } from 'interface/icons';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

const CRIT_DAMAGE_INCREASE = 0.25;

// Example log: https://www.warcraftlogs.com/reports/y4JjxpGnmqLtNVhd#fight=35&type=damage-done&source=27
class ChampionsMight extends Analyzer.withDependencies({
  enemeies: Enemies,
}) {
  private _numberOfCasts: number = 0;
  private _numberOfCrits: number = 0;
  private _increasedCritDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CHAMPIONS_MIGHT_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAMPIONS_SPEAR),
      this.onCast,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  private onCast(event: CastEvent) {
    this._numberOfCasts += 1;
  }

  private onDamage(event: DamageEvent) {
    if (
      this.deps.enemeies
        .getById(event.targetID, event.targetInstance)
        ?.hasBuff(SPELLS.CHAMPIONS_SPEAR_DAMAGE) &&
      event.hitType === HIT_TYPES.CRIT
    ) {
      this._numberOfCrits += 1;
      this._increasedCritDamage += calculateEffectiveDamage(event, CRIT_DAMAGE_INCREASE);
    }
  }

  public increasedCritDamage() {
    return this._increasedCritDamage;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        tooltip={
          <p>
            A total of {this._numberOfCrits} crits were increased by{' '}
            {formatPercentage(CRIT_DAMAGE_INCREASE, 0)}% to for a total of{' '}
            {formatNumber(this._increasedCritDamage)} damage.
          </p>
        }
      >
        <BoringSpellValueText spell={TALENTS.CHAMPIONS_MIGHT_TALENT}>
          <DamageIcon /> {formatNumber(this.owner.getPerSecond(this._increasedCritDamage))} DPS
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChampionsMight;
