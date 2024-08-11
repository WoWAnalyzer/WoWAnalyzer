import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_PRIEST } from 'common/TALENTS';

const HARSH_DISCIPLINE_BOLTS_PER_RANK = [0, 1, 2];

class Penance extends Analyzer {
  _boltCount = 0; // which bolt of the cast it is - for other modules
  _casts = 0;
  _defaultBolts = 0;
  _totalExpectedBolts = 0;
  _totalBoltHits = 0;
  _missedBolts = 0;
  _harshDisciplineBolts = 0;

  constructor(options) {
    super(options);
    this._defaultBolts = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CASTIGATION_TALENT)
      ? 4
      : 3;

    this._harshDisciplineBolts =
      HARSH_DISCIPLINE_BOLTS_PER_RANK[
        this.selectedCombatant.getTalentRank(TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT)
      ];

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PENANCE_CAST, SPELLS.DARK_REPRIMAND_CAST]),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.PENANCE, SPELLS.DARK_REPRIMAND_DAMAGE]),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.PENANCE_HEAL, SPELLS.DARK_REPRIMAND_HEAL]),
      this.onHeal,
    );
  }

  static isPenance = (spellId) =>
    spellId === SPELLS.PENANCE.id ||
    spellId === SPELLS.DARK_REPRIMAND_DAMAGE.id ||
    spellId === SPELLS.PENANCE_HEAL.id ||
    spellId === SPELLS.DARK_REPRIMAND_HEAL.id ||
    spellId === SPELLS.PENANCE_CAST.id ||
    spellId === SPELLS.DARK_REPRIMAND_CAST.id;

  onDamage(event) {
    event.penanceBoltNumber = this._boltCount;
    this._boltCount += 1;
    this._totalBoltHits += 1;
  }

  onHeal(event) {
    event.penanceBoltNumber = this._boltCount;
    this._boltCount += 1;
    this._totalBoltHits += 1;
  }

  onCast(event) {
    this._casts += 1;
    this._totalExpectedBolts += this._defaultBolts;

    if (this.selectedCombatant.hasBuff(SPELLS.HARSH_DISCIPLINE_BUFF.id)) {
      this._totalExpectedBolts +=
        this._harshDisciplineBolts *
        this.selectedCombatant.getBuffStacks(SPELLS.HARSH_DISCIPLINE_BUFF.id, event.timestamp);
    }

    this._boltCount = 0;
  }

  statistic() {
    this._missedBolts = this._totalExpectedBolts - this._totalBoltHits;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="small"
        tooltip={
          <>
            Each <SpellLink spell={SPELLS.PENANCE} /> cast has 3 bolts (4 if you're using{' '}
            <SpellLink spell={TALENTS_PRIEST.CASTIGATION_TALENT} />
            {this._harshDisciplineBolts > 0 && (
              <>
                , and potentially {this._harshDisciplineBolts} more per stack of{' '}
                <SpellLink spell={TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT} />
              </>
            )}
            ). You should try to let this channel finish as much as possible. You channeled Penance{' '}
            {this._casts} times.
          </>
        }
      >
        <BoringSpellValue
          spell={SPELLS.PENANCE.id}
          value={this._missedBolts}
          label={
            <>
              Wasted <SpellLink spell={SPELLS.PENANCE} /> or{' '}
              <SpellLink spell={SPELLS.DARK_REPRIMAND_CAST} /> bolts.
            </>
          }
        />
      </Statistic>
    );
  }
}

export default Penance;
