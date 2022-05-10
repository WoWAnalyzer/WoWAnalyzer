import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventGrouper from 'parser/core/EventGrouper';
import Events from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Penance extends Analyzer {
  _expectedBoltCount = 0;
  _boltCount = 0;
  _missedBolts = 0;
  _casts = 0;

  constructor(options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_CAST), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  static isPenance = (spellId) =>
    spellId === SPELLS.PENANCE.id ||
    spellId === SPELLS.PENANCE_HEAL.id ||
    spellId === SPELLS.PENANCE_CAST.id;

  onDamage(event) {
    if (!Penance.isPenance(event.ability.guid)) {
      return;
    }

    event.penanceBoltNumber = this._boltCount;
    this._boltCount += 1;
  }

  onHeal(event) {
    if (!Penance.isPenance(event.ability.guid)) {
      return;
    }

    event.penanceBoltNumber = this._boltCount;
    this._boltCount += 1;
  }

  onCast(event) {
    this._casts += 1;
    this._missedBolts += this._expectedBoltCount - this._boltCount;
    this.calculateExpectedBolts(event);
    this._boltCount = 0;
  }

  calculateExpectedBolts(cast = null) {
    this._expectedBoltCount = this.selectedCombatant.hasTalent(SPELLS.CASTIGATION_TALENT.id)
      ? 4
      : 3;
    if (cast) {
      if (this.selectedCombatant.hasBuff(SPELLS.THE_PENITENT_ONE_BUFF.id)) {
        this._expectedBoltCount += 3;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="small"
        tooltip={
          <>
            Each <SpellLink id={SPELLS.PENANCE.id} /> cast has 3 bolts (4 if you're using{' '}
            <SpellLink id={SPELLS.CASTIGATION_TALENT.id} />
            ). You should try to let this channel finish as much as possible. You channeled Penance{' '}
            {this._casts} times.
          </>
        }
      >
        <BoringSpellValue
          spellId={SPELLS.PENANCE.id}
          value={this._missedBolts}
          label={
            <>
              Wasted <SpellLink id={SPELLS.PENANCE.id} /> bolts
            </>
          }
        />
      </Statistic>
    );
  }
}

export default Penance;
