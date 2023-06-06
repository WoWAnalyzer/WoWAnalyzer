import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class Volatility extends Analyzer {
  damageFromPyre: number = 0;
  extraDamageFromVola: number = 0;
  volaProcs: number = 0;
  volaProc: boolean = false;
  pyreCastedTime: number = 0;
  pyreDamageEvent: number = 0;
  previousPyreDamageEvent: number = 0;
  dragonRageApplied: number = 0;
  pyreFromDragonrage: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOLATILITY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.DRAGONRAGE_TALENT),
      this.dragonRage,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PYRE_DENSE_TALENT),
      this.onCast,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYRE), this.onHit);
  }

  dragonRage(event: ApplyBuffEvent) {
    this.dragonRageApplied = event.timestamp;
    this.pyreFromDragonrage = true;
  }

  // Use this function to properly filter the damage / proc
  onHit(event: DamageEvent) {
    this.pyreDamageEvent = event.timestamp;

    if (this.previousPyreDamageEvent < this.dragonRageApplied) {
      this.previousPyreDamageEvent = this.pyreDamageEvent;
    } else if (this.previousPyreDamageEvent < this.pyreCastedTime) {
      this.previousPyreDamageEvent = this.pyreDamageEvent;
    } else if (this.previousPyreDamageEvent < this.pyreDamageEvent) {
      this.previousPyreDamageEvent = this.pyreDamageEvent;
      this.pyreFromDragonrage = false;
      this.volaProc = true;
      this.volaProcs += 1;
    }
    if (this.pyreFromDragonrage && this.previousPyreDamageEvent === this.pyreDamageEvent) {
      // track damage from DR idk yet just filter it away for now :))
    } else if (!this.volaProc && this.previousPyreDamageEvent === this.pyreDamageEvent) {
      // Just tracking incase we wanna use it for something in the future
      this.damageFromPyre += event.amount;
    } else if (this.volaProc && this.previousPyreDamageEvent === this.pyreDamageEvent) {
      this.extraDamageFromVola += event.amount;
    }
  }

  onCast(event: CastEvent) {
    this.pyreCastedTime = event.timestamp;
    this.volaProc = false;
    this.pyreFromDragonrage = false;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.VOLATILITY_TALENT.id}>
          <ItemDamageDone amount={this.extraDamageFromVola} /> <br />
          <span style={{ fontSize: '65%' }}>{Math.floor(this.volaProcs)} procs.</span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Volatility;
