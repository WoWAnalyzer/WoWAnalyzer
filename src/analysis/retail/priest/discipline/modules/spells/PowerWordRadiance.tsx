import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Atonement from './Atonement';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';

type RadianceInfo = {
  cast: CastEvent;
  goodCast: boolean;
  onAtoned: boolean;
};

class PowerWordRadiance extends Analyzer {
  radianceCasts: RadianceInfo[] = [];
  radAtones = 0;
  static dependencies = {
    combatants: Combatants,
    atonement: Atonement,
  };
  protected atonement!: Atonement;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE),
      this.onRadiance,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF),
      this.onRadianceAtone,
    );
  }

  onRadiance(event: CastEvent) {
    const target = this.combatants.getEntity(event);
    const castInfo = { cast: event, goodCast: false, onAtoned: false };

    if (target?.hasBuff(SPELLS.ATONEMENT_BUFF.id)) {
      castInfo.onAtoned = true;
    }
    this.radianceCasts.push(castInfo);
  }

  onRadianceAtone(event: ApplyBuffEvent) {
    if (this.radianceCasts.length === 0) {
      return;
    }

    if (event.timestamp === this.radianceCasts[this.radianceCasts.length - 1].cast.timestamp) {
      this.radAtones += 1;
      if (this.radAtones === 5) {
        this.radAtones = 0;
        this.radianceCasts[this.radianceCasts.length - 1].goodCast = true;
      }
    } else {
      this.radAtones = 0;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT} />
        </strong>{' '}
        is the fastest way to apply lots of atonements, and casting it effectively is an important
        part of maximising the value of ramps with and without{' '}
        <SpellLink spell={TALENTS_PRIEST.EVANGELISM_TALENT} />. Try to make sure every cast applies
        5 atonements, and that it isn't cast on a target which already has atonement.
      </p>
    );

    const castPerfBoxes = this.radianceCasts.map((radianceCast) => {
      let value: QualitativePerformance;
      if (radianceCast.goodCast && !radianceCast.onAtoned) {
        value = QualitativePerformance.Good;
      } else if (!radianceCast.goodCast && radianceCast.onAtoned) {
        // cast on a target with atonement and you got less than 5 people with it
        value = QualitativePerformance.Fail;
      } else {
        value = QualitativePerformance.Ok;
      }
      return {
        value,
        tooltip: `@ ${this.owner.formatTimestamp(radianceCast.cast.timestamp)}.
        ${
          radianceCast.onAtoned
            ? 'Power Word: Radiance cast on a target that already has atonement.'
            : ''
        }
        ${
          radianceCast.goodCast
            ? ''
            : 'Power Word: Radiance applied atonement to less than five targets.'
        }
        `,
      };
    });
    const data = (
      <div>
        <strong>
          <SpellLink spell={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT} />
        </strong>
        <small>
          {' '}
          - Green means a good cast. Yellow means a cast was either used on a target which already
          had <SpellLink spell={TALENTS_PRIEST.ATONEMENT_TALENT} /> or a cast applied less than five
          atonements. Red means both of the yellow cases occured.
        </small>
        <PerformanceBoxRow values={castPerfBoxes} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }
}

export default PowerWordRadiance;
