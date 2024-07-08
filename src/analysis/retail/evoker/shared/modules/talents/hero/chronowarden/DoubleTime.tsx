import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  DamageEvent,
  EmpowerEndEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  RefreshBuffEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import {
  getDreamBreathCast,
  getDreamBreathHealing,
} from 'analysis/retail/evoker/preservation/normalizers/EventLinking/helpers';
import HIT_TYPES from 'game/HIT_TYPES';
import {
  FIRE_BREATH,
  FIRE_BREATH_CAST,
} from 'analysis/retail/evoker/preservation/normalizers/EventLinking/constants';
import { DOUBLE_TIME_EXTENSION } from 'analysis/retail/evoker/preservation/constants';

class DoubleTime extends Analyzer {
  // Dream Breath
  totalDbs: number = 0;
  sumDbDurations: number = 0;
  dbDurations: number[] = [0, 16, 12, 8, 4];
  // Fire Breath
  blastFurnace: boolean = false;
  totalFbs: number = 0;
  sumFbDurations: number = 0;
  fbDurations: number[] = [0, 20, 14, 8, 2];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.DOUBLE_TIME_TALENT);
    this.blastFurnace = this.selectedCombatant.hasTalent(TALENTS_EVOKER.BLAST_FURNACE_TALENT);

    // Dream Breath
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH, SPELLS.DREAM_BREATH_ECHO]),
      this.onApplyDb,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH, SPELLS.DREAM_BREATH_ECHO]),
      this.onApplyDb,
    );

    // Fire Breath
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BREATH_DOT),
      this.onApplyFb,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BREATH_DOT),
      this.onApplyFb,
    );
  }

  onApplyDb(event: ApplyBuffEvent | RefreshBuffEvent) {
    const castEvent = getDreamBreathCast(event);
    if (castEvent) {
      this.totalDbs += 1;
      const healEvents = getDreamBreathHealing(event);
      let extensions = 0;
      for (const heal of healEvents) {
        if (heal.hitType === HIT_TYPES.CRIT) {
          extensions += DOUBLE_TIME_EXTENSION;
        }
      }
      this.sumDbDurations +=
        this.dbDurations[castEvent.empowermentLevel] + (extensions > 12 ? 12 : extensions);
    }
  }

  onApplyFb(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const castEvent = GetRelatedEvent<EmpowerEndEvent>(event, FIRE_BREATH_CAST);
    if (castEvent) {
      this.totalFbs += 1;
      const dotEvents = GetRelatedEvents<DamageEvent>(event, FIRE_BREATH);
      let extensions = 0;
      for (const tick of dotEvents) {
        if (tick.hitType === HIT_TYPES.CRIT) {
          extensions += DOUBLE_TIME_EXTENSION;
        }
      }
      this.sumFbDurations +=
        this.fbDurations[castEvent.empowermentLevel] +
        (this.blastFurnace ? 4 : 0) +
        (extensions > 12 ? 12 : extensions);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.DOUBLE_TIME_TALENT}>
          <div>
            <small>
              <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} />
            </small>
            <br />
            {(this.sumDbDurations / this.totalDbs).toFixed(1)}s{' '}
            <small>
              average <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> duration
            </small>
          </div>
          <div>
            <small>
              <SpellLink spell={SPELLS.FIRE_BREATH} />
            </small>
            <br />
            {(this.sumFbDurations / this.totalFbs).toFixed(1)}s{' '}
            <small>
              average <SpellLink spell={SPELLS.FIRE_BREATH} /> duration
            </small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default DoubleTime;
