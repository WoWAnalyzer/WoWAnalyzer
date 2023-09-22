import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const BUFFER = 350;

class PowerSiphon extends Analyzer {
  get totalCores() {
    return this.casts.reduce((total, current) => total + current, 0);
  }

  get averageCores() {
    return this.totalCores / this.casts.length || 0;
  }

  _cast: number | null = null;
  _count = 0;
  casts: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.POWER_SIPHON_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.POWER_SIPHON_TALENT),
      this.handlePowerSiphonCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.handleDemonicCore,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.handleDemonicCore,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.handleDemonicCore,
    );
    this.addEventListener(Events.fightend, this.onFinished);
  }

  handlePowerSiphonCast(event: CastEvent) {
    if (this._cast !== null) {
      this.casts.push(this._count);
    }
    this._cast = event.timestamp;
    this._count = 0;
  }

  handleDemonicCore(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    if (this._cast && event.timestamp <= this._cast + BUFFER) {
      this._count += 1;
    }
  }

  onFinished() {
    this.casts.push(this._count);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Average Demonic Core stacks per cast: ${this.averageCores.toFixed(2)}`}
      >
        <BoringSpellValueText spell={TALENTS.POWER_SIPHON_TALENT}>
          {this.totalCores} <small>Bonus cores</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PowerSiphon;
