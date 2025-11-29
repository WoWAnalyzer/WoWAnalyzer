import { formatNumber, formatPercentage } from 'common/format';
import talents from 'common/TALENTS/monk';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import {
  MajorDefensiveBuff,
  Mitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { MitigationSegment } from 'interface/guide/components/MajorDefensives/MitigationSegments';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  ResourceActor,
} from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ReactNode } from 'react';
import CountsAsBrew from '../../components/CountsAsBrew';
import { damageEvent } from './normalizer';
import Spell from 'common/SPELLS/Spell';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SPELLS from '../../../spell-list_Monk_Brewmaster.retail';

const WASTED_THRESHOLD = 0.25;
const GOOD_THRESHOLD = 0.5;

interface AbsorbExtras {
  wastedAmount: number;
}

type Absorb = Mitigation & AbsorbExtras;

class CelestialBrew extends MajorDefensiveBuff {
  private _absorbs: AbsorbExtras[] = [];

  private displaySpell: Spell;

  constructor(options: Options) {
    super(
      talents.CELESTIAL_BREW_TALENT,
      {
        applyTrigger: Events.applybuff
          .spell([talents.CELESTIAL_BREW_TALENT, talents.CELESTIAL_INFUSION_TALENT])
          .by(SELECTED_PLAYER),
        removeTrigger: Events.removebuff
          .spell([talents.CELESTIAL_BREW_TALENT, talents.CELESTIAL_INFUSION_TALENT])
          .by(SELECTED_PLAYER),
        trackOn: ResourceActor.Source,
        isMatchingApply: () => true,
      },
      options,
    );

    this.active =
      this.selectedCombatant.hasTalent(talents.CELESTIAL_BREW_TALENT) ||
      this.selectedCombatant.hasTalent(talents.CELESTIAL_INFUSION_TALENT);

    this.displaySpell = this.selectedCombatant.hasTalent(talents.CELESTIAL_BREW_TALENT)
      ? talents.CELESTIAL_BREW_TALENT
      : talents.CELESTIAL_INFUSION_TALENT;

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([talents.CELESTIAL_BREW_TALENT, talents.CELESTIAL_INFUSION_TALENT]),
      this.updateMaxAbsorb,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([talents.CELESTIAL_BREW_TALENT, talents.CELESTIAL_INFUSION_TALENT]),
      this._resetAbsorb,
    );

    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([talents.CELESTIAL_BREW_TALENT, talents.CELESTIAL_INFUSION_TALENT]),
      this._expireAbsorb,
    );

    this.addEventListener(
      Events.absorbed
        .by(SELECTED_PLAYER)
        .spell([talents.CELESTIAL_BREW_TALENT, talents.CELESTIAL_INFUSION_TALENT]),
      this._cbAbsorb,
    );
  }

  get absorbs(): Absorb[] {
    return this.mitigations.map((mit, ix) => ({ ...mit, ...this._absorbs[ix] }));
  }

  description(): ReactNode {
    return (
      <div>
        <p>
          <SpellLink spell={this.displaySpell} /> provides a low-cooldown shield for a large percent
          of your health bar.{' '}
          <CountsAsBrew
            baseCooldown={SPELLS.CELESTIAL_BREW_TALENT.cooldown.duration / 1000}
            lightBrewing={this.selectedCombatant.hasTalent(talents.LIGHT_BREWING_TALENT)}
          />{' '}
          To use it effectively, you need to balance two goals: using it to{' '}
          <em>cover major damage events</em>, and using it <em>often</em>.
        </p>
      </div>
    );
  }

  statistic() {
    const avgAbsorb =
      this.absorbs.length === 0
        ? 0
        : this.absorbs.reduce((total, absorb) => total + absorb.amount, 0) / this.absorbs.length;
    const wastedAbsorb = this.absorbs.reduce((total, absorb) => total + absorb.wastedAmount, 0);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <>
            Does not include <strong>{formatNumber(wastedAbsorb)} wasted absorb</strong> (avg:{' '}
            <strong>{formatNumber(wastedAbsorb / this._absorbs.length)}</strong>).
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={this.displaySpell} /> Avg. Absorb per Celestial Brew
            </>
          }
        >
          {formatNumber(avgAbsorb)}
        </BoringValue>
      </Statistic>
    );
  }

  maxMitigationDescription(): ReactNode {
    return <>Shield Size</>;
  }

  private updateMaxAbsorb(event: ApplyBuffEvent) {
    if (!event.absorb) {
      return;
    }
    this.setMaxMitigation(event, event.absorb);
  }

  private get currentAbsorb(): AbsorbExtras | undefined {
    return this._absorbs[this._absorbs.length - 1];
  }

  private _resetAbsorb() {
    this._absorbs.push({
      wastedAmount: 0,
    });
  }

  private _cbAbsorb(event: AbsorbedEvent) {
    if (!this.defensiveActive) {
      console.error('CB absorb detected without CB active!', event);
      return;
    }

    this.recordMitigation({
      // we try to put in the damage event, but worst case we plug in the absorb event
      event: damageEvent(event) ?? { ...event, ability: event.extraAbility },
      mitigatedAmount: event.amount,
    });
  }

  private _expireAbsorb(event: RemoveBuffEvent) {
    if (this.currentAbsorb) {
      this.currentAbsorb.wastedAmount = event.absorb || 0;
    }
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    const absorb = this.absorbs.find((absorb) => absorb.start === mit.start)!;
    const totalAmount = absorb.amount + absorb.wastedAmount;

    return [
      {
        amount: totalAmount,
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        description: (
          <>
            <SpellLink spell={this.displaySpell} />
          </>
        ),
      },
    ];
  }

  explainPerformance(mit: Mitigation) {
    const absorb = this.absorbs.find((absorb) => absorb.start === mit.start);

    if (!absorb || !absorb.maxAmount) {
      return { perf: QualitativePerformance.Good };
    }

    if (absorb.wastedAmount / absorb.maxAmount > 1 - WASTED_THRESHOLD) {
      return {
        perf: QualitativePerformance.Ok,
        explanation: `Shield expired with at least ${formatPercentage(WASTED_THRESHOLD)}% remaining`,
      };
    } else if (absorb.wastedAmount / absorb.maxAmount > 1 - GOOD_THRESHOLD) {
      return {
        perf: QualitativePerformance.Good,
        explanation: `At least ${formatPercentage(GOOD_THRESHOLD)} of the shield was consumed`,
      };
    } else if (absorb.wastedAmount === 0) {
      return {
        perf: QualitativePerformance.Perfect,
        explanation: `The entire shield was consumed`,
      };
    }

    return { perf: QualitativePerformance.Good };
  }
}

export default CelestialBrew;
