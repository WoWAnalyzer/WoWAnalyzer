import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ResourceChangeEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { Uptime } from 'parser/ui/UptimeBar';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const MIN_ENERGY_THRESHOLD = 70;
const MAX_ENERGY_THRESHOLD = 90;
const ACCEPTABLE_ENERGY_THRESHOLD = 80;

//-- TODO: MAX_ENERGY_THRESHOLD should scale with targets hit to support aoe fights

class BladeRush extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  unusableUptimes: Uptime[] = [];
  isInUsablePeriod: boolean = false;
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLADE_RUSH_TALENT);

    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onResourceChange);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BLADE_RUSH_TALENT),
      this.onBladeRush,
    );

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.BLADE_RUSH_TALENT),
      this.onBladeRushUsable,
    );

    this.unusableUptimes.push({
      start: this.owner.fight.start_time,
      end: -1,
    });

    this.addEventListener(Events.fightend, this.finalize);
  }

  private endUsablePeriod(timestamp: number) {
    if (this.isInUsablePeriod) {
      this.isInUsablePeriod = false;
      this.unusableUptimes.push({
        start: timestamp,
        end: -1,
      });
    }
  }

  private startUsablePeriod(timestamp: number) {
    if (!this.isInUsablePeriod) {
      this.isInUsablePeriod = true;
      this.unusableUptimes.at(-1)!.end = timestamp;
    }
  }

  // Record the accuracy of every Blade Rush casts
  private onBladeRush(event: CastEvent) {
    let value = QualitativePerformance.Good;
    const energy = getResource(event.classResources, RESOURCE_TYPES.ENERGY.id);
    const tooltip = (
      <>
        At {this.owner.formatTimestamp(event.timestamp)} you cast{' '}
        <SpellLink id={TALENTS.BLADE_RUSH_TALENT} /> at {energy!.amount} energy
      </>
    );

    if (energy!.amount > MAX_ENERGY_THRESHOLD) {
      value = QualitativePerformance.Fail;
    } else if (energy!.amount > ACCEPTABLE_ENERGY_THRESHOLD) {
      value = QualitativePerformance.Ok;
    }
    this.castEntries.push({ value, tooltip });
  }

  // Record periods spent under MIN_ENERGY_THRESHOLD with BR off cd
  private onResourceChange(event: ResourceChangeEvent) {
    const energy = getResource(event.classResources, RESOURCE_TYPES.ENERGY.id);
    const energyAmount = energy?.amount;
    if (!energy || !energyAmount || this.spellUsable.isOnCooldown(TALENTS.BLADE_RUSH_TALENT.id)) {
      return;
    }

    if (energyAmount <= MIN_ENERGY_THRESHOLD) {
      this.startUsablePeriod(event.timestamp);
    } else {
      this.endUsablePeriod(event.timestamp);
    }
  }

  // Count blade rush time spent off cd
  private onBladeRushUsable(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.BeginCooldown) {
      this.endUsablePeriod(event.timestamp);
    }
  }

  private finalize() {
    const uptime = this.unusableUptimes.at(-1);
    if (!uptime) {
      return;
    }

    uptime.end = this.owner.fight.end_time;
  }

  get guide(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink id={TALENTS.BLADE_RUSH_TALENT} />
        </strong>{' '}
        should be used whenever your energy drop under 70-80, this energy threshold increase with
        target count. At around 9 targets it is safe to use{' '}
        <SpellLink id={TALENTS.BLADE_RUSH_TALENT} /> on cooldown regardless of energy.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS.BLADE_RUSH_TALENT} /> utilization
          </strong>
          <div>
            <small>
              Grey periods indicate periods where your energy went under the recommended energy
              threshold but you did not use <SpellLink id={TALENTS.BLADE_RUSH_TALENT} />.
            </small>
            {uptimeBarSubStatistic(
              this.owner.fight,
              {
                spells: [TALENTS.BLADE_RUSH_TALENT],
                uptimes: this.unusableUptimes,
              },
              undefined,
              undefined,
              undefined,
              'utilization',
            )}
            <strong>Casts </strong>
            <small>
              - Green indicates an efficient cast under {ACCEPTABLE_ENERGY_THRESHOLD} energy, yellow
              indicate a cast slighlty above the recommended energy threshold, while red indicates a
              "wasted" cast above the recommended energy threshold (Ignore this section in aoe for
              now)
            </small>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 40);
  }
}

export default BladeRush;
