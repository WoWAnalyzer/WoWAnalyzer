import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EmpowerEndEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

const REDUCTION_MS = 5000;

const BASE_EMPOWER_CD = 30000;
const SPIRITUAL_CLARITY_REDUCTION = 10000;

class NozTeachings extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;
  hasFont: boolean = false;
  sbCdr: number = 0;
  dbCdr: number = 0;
  fbCdr: number = 0;
  sbWastedCdr: number = 0;
  dbWastedCdr: number = 0;
  fbWastedCdr: number = 0;
  sbCasts: number = 0;
  dbCasts: number = 0;
  fbCasts: number = 0;
  hasSpiritualClarity: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.NOZDORMUS_TEACHINGS_TALENT);
    this.hasFont = this.selectedCombatant.hasTalent(
      TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT,
    );
    this.hasSpiritualClarity = this.selectedCombatant.getTalentRank(
      TALENTS_EVOKER.SPIRITUAL_CLARITY_TALENT,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.empowerEnd.by(SELECTED_PLAYER).spell([SPELLS.FIRE_BREATH, SPELLS.FIRE_BREATH_FONT]),
      this.onFbCast,
    );
    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.SPIRITBLOOM_TALENT, SPELLS.SPIRITBLOOM_FONT]),
      this.onSbCast,
    );
    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.DREAM_BREATH_TALENT, SPELLS.DREAM_BREATH_FONT]),
      this.onDbCast,
    );
  }

  onCast(event: CastEvent) {
    let sbCdr = 0;
    let dbCdr = 0;
    let fbCdr = 0;
    if (this.hasFont) {
      sbCdr = this.spellUsable.reduceCooldown(SPELLS.SPIRITBLOOM_FONT.id, REDUCTION_MS);
      dbCdr = this.spellUsable.reduceCooldown(SPELLS.DREAM_BREATH_FONT.id, REDUCTION_MS);
      fbCdr = this.spellUsable.reduceCooldown(SPELLS.FIRE_BREATH_FONT.id, REDUCTION_MS);
    } else {
      sbCdr = this.spellUsable.reduceCooldown(TALENTS_EVOKER.SPIRITBLOOM_TALENT.id, REDUCTION_MS);
      dbCdr = this.spellUsable.reduceCooldown(TALENTS_EVOKER.DREAM_BREATH_TALENT.id, REDUCTION_MS);
      fbCdr = this.spellUsable.reduceCooldown(SPELLS.FIRE_BREATH.id, REDUCTION_MS);
    }
    this.sbCdr += sbCdr;
    this.dbCdr += dbCdr;
    this.fbCdr += fbCdr;
    this.sbWastedCdr += REDUCTION_MS - sbCdr;
    this.dbWastedCdr += REDUCTION_MS - dbCdr;
    this.fbWastedCdr += REDUCTION_MS - fbCdr;
  }

  onFbCast(event: EmpowerEndEvent) {
    this.fbCasts += 1;
  }

  onDbCast(event: EmpowerEndEvent) {
    this.dbCasts += 1;
  }

  onSbCast(event: EmpowerEndEvent) {
    this.sbCasts += 1;
  }

  get averageFbCdr() {
    return this.fbCdr / this.fbCasts - 1;
  }

  get averageDbCdr() {
    return this.dbCdr / this.dbCasts - 1;
  }

  get averageSbCdr() {
    return this.sbCdr / this.sbCasts - 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              Total wasted <SpellLink spell={SPELLS.FIRE_BREATH} /> CDR:{' '}
              {formatDuration(this.fbWastedCdr)}
            </div>
            <div>
              Total wasted <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> CDR:{' '}
              {formatDuration(this.sbWastedCdr)}
            </div>
            <div>
              Total wasted <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> CDR:{' '}
              {formatDuration(this.dbWastedCdr)}
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.NOZDORMUS_TEACHINGS_TALENT}>
          <div>
            {formatDuration(
              BASE_EMPOWER_CD -
                this.averageSbCdr -
                SPIRITUAL_CLARITY_REDUCTION * this.hasSpiritualClarity,
            )}{' '}
            <small>
              average <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> cooldown
            </small>
          </div>
          <div>
            {formatDuration(BASE_EMPOWER_CD - this.averageFbCdr)}{' '}
            <small>
              average <SpellLink spell={SPELLS.FIRE_BREATH} /> cooldown
            </small>
          </div>
          <div>
            {formatDuration(BASE_EMPOWER_CD - this.averageDbCdr)}{' '}
            <small>
              average <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> cooldown
            </small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default NozTeachings;
