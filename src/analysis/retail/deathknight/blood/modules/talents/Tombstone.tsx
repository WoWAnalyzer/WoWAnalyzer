import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const RP_PER_CHARGE = 6;
const MAX_CHARGES = 5;

interface TombstoneEvent {
  charges: number;
  rpGained: number;
  rpWasted: number;
  absorbSize: number;
  totalAbsorbed: number;
  absorbedWasted: number;
}

class Tombstone extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
  };

  protected damageTracker!: DamageTracker;

  tombstone: TombstoneEvent[] = [];
  casts = 0;
  rpGained = 0;
  rpWasted = 0;
  absorbSize = 0;
  totalAbsorbed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TOMBSTONE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(TALENTS.TOMBSTONE_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.resourcechange.to(SELECTED_PLAYER).spell(TALENTS.TOMBSTONE_TALENT),
      this.onEnergize,
    );
    this.addEventListener(
      Events.absorbed.to(SELECTED_PLAYER).spell(TALENTS.TOMBSTONE_TALENT),
      this.onAbsorb,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(TALENTS.TOMBSTONE_TALENT),
      this.onRemoveBuff,
    );
  }

  get wastedCasts() {
    return this.tombstone.filter((e) => e.charges < MAX_CHARGES).length;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.casts += 1;
    if (event.absorb) {
      this.absorbSize = event.absorb;
    }
  }

  onEnergize(event: ResourceChangeEvent) {
    this.rpGained = event.resourceChange;
    this.rpWasted = event.waste;
  }

  onAbsorb(event: AbsorbedEvent) {
    this.totalAbsorbed += event.amount;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.tombstone.push({
      rpGained: this.rpGained,
      rpWasted: this.rpWasted,
      absorbSize: this.absorbSize,
      totalAbsorbed: this.totalAbsorbed,
      absorbedWasted: this.absorbSize - this.totalAbsorbed,
      charges: this.rpGained / RP_PER_CHARGE,
    });
    this.totalAbsorbed = 0;
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: 1 - this.wastedCasts / this.casts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You casted {this.wastedCasts} <SpellLink spell={TALENTS.TOMBSTONE_TALENT} /> with less
          than 5 charges causing a reduced absorb shield.
        </>,
      )
        .icon(TALENTS.TOMBSTONE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% bad Tombstone casts`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Any cast without 5 charges is considered a wasted cast."
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <>
                  <th>Charges</th>
                  <th>RP Wasted</th>
                  <th>Absorb Used (%)</th>
                </>
              </tr>
            </thead>
            <tbody>
              {Object.values(this.tombstone).map((e, i) => (
                <tr key={i}>
                  <td>{this.tombstone[i].charges}</td>
                  <td>
                    <TooltipElement
                      content={
                        <>
                          <strong>RP Generated:</strong>{' '}
                          {this.tombstone[i].rpGained - this.tombstone[i].rpWasted}
                        </>
                      }
                    >
                      {this.tombstone[i].rpWasted}
                    </TooltipElement>
                  </td>
                  <td>
                    <TooltipElement
                      content={
                        <>
                          <strong>Damage Absorbed:</strong>{' '}
                          {formatNumber(this.tombstone[i].totalAbsorbed)} <br />
                          <strong>Absorb Shield: </strong>{' '}
                          {formatNumber(this.tombstone[i].absorbSize)} <br />
                          <strong>Healing: </strong>{' '}
                          {this.owner.formatItemHealingDone(this.tombstone[i].totalAbsorbed)}
                        </>
                      }
                    >
                      {formatPercentage(
                        this.tombstone[i].totalAbsorbed / this.tombstone[i].absorbSize,
                      )}
                      %
                    </TooltipElement>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BoringSpellValueText spell={TALENTS.TOMBSTONE_TALENT}>
          <>
            {this.wastedCasts} <small>Bad Casts</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Tombstone;
