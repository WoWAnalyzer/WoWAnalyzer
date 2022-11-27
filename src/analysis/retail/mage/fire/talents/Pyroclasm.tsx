import { Trans } from '@lingui/macro';
import { MS_BUFFER_250 } from 'analysis/retail/mage/shared';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DAMAGE_MODIFIER = 240;
const FIGHT_END_BUFFER = 5000;

const debug = false;

class Pyroclasm extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;

  totalProcs = 0;
  usedProcs = 0;
  unusedProcs = 0;
  overwrittenProcs = 0;
  badPyroclasmDuringCombustion = 0;
  buffAppliedEvent?: ApplyBuffEvent | ApplyBuffStackEvent;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PYROCLASM_TALENT.id);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF),
      this.onPyroclasmApplied,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF),
      this.onPyroclasmApplied,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF),
      this.onPyroclasmRemoved,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF),
      this.onPyroclasmRemoved,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.PYROCLASM_BUFF),
      this.onPyroclasmRefresh,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PYROBLAST_TALENT),
      this.onPyroblastCast,
    );
    this.addEventListener(Events.fightend, this.onFinished);
  }

  //Counts the number of times Pyroclasm was applied
  onPyroclasmApplied(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.totalProcs += 1;
    this.buffAppliedEvent = event;
    debug && this.log('Buff Applied');
  }

  //Checks Pyroblast casts during Combustion to see if the player hard casted Pyroblast during Combustion while they were capped or near capped on charges of Phoenix Flames or Fire Blast
  onPyroblastCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id)) {
      return;
    }

    const PHOENIX_FLAMES_MAX_CHARGES = this.selectedCombatant.hasTalent(
      TALENTS.CALL_OF_THE_SUN_KING_TALENT,
    )
      ? 3
      : 2;
    const pyroblastBeginCast = this.eventHistory.last(
      1,
      MS_BUFFER_250,
      Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.PYROBLAST_TALENT),
    );
    if (pyroblastBeginCast.length > 0) {
      return;
    }

    const currentFireBlastCharges = this.spellUsable.chargesAvailable(SPELLS.FIRE_BLAST.id);
    const maxFireBlastCharges = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT.id)
      ? 3
      : 2;
    const currentPhoenixFlamesCharges = this.spellUsable.chargesAvailable(
      TALENTS.PHOENIX_FLAMES_TALENT.id,
    );
    if (
      currentFireBlastCharges === maxFireBlastCharges ||
      currentPhoenixFlamesCharges === PHOENIX_FLAMES_MAX_CHARGES
    ) {
      this.badPyroclasmDuringCombustion += 1;
    }
  }

  //Checks to see if Pyroclasm was removed because it was used (there was a non instant pyroblast within 250ms) or because it expired.
  onPyroclasmRemoved(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    //If the player hard casts Pyroblast into an instant Pyroblast there will be multiple pyroblast cast events within 250ms. So we need to grab the first one
    const lastPyroblastCast = this.eventHistory.last(
      undefined,
      MS_BUFFER_250,
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PYROBLAST_TALENT),
    )[0];
    if (!lastPyroblastCast) {
      return;
    }
    const lastPyroblastBeginCast = lastPyroblastCast.channel ? lastPyroblastCast.channel.start : 0;

    if (lastPyroblastCast.timestamp - lastPyroblastBeginCast <= MS_BUFFER_250) {
      this.unusedProcs += 1;
      debug && this.log('Buff Expired');
    } else {
      this.usedProcs += 1;
      debug && this.log('Buff Used');
    }
  }

  //Counts the number of procs that were refreshed. This means that they had 2 procs available and gained another one. Therefore the gained proc is wasted.
  onPyroclasmRefresh() {
    this.overwrittenProcs += 1;
    this.totalProcs += 1;
    debug && this.log('Buff Refreshed');
  }

  //If the player has a Pyroclasm proc when the fight ends and they got the proc within the last 5 seconds of the fight, then ignore it. Otherwise, it was wasted.
  onFinished() {
    if (!this.buffAppliedEvent) {
      return;
    }
    const hasPyroclasmBuff = this.selectedCombatant.hasBuff(SPELLS.PYROCLASM_BUFF.id);
    const adjustedFightEnding = this.owner.currentTimestamp - FIGHT_END_BUFFER;
    if (hasPyroclasmBuff && this.buffAppliedEvent.timestamp < adjustedFightEnding) {
      this.unusedProcs += 1;
      debug && this.log('Fight ended with an unused proc');
    } else if (hasPyroclasmBuff) {
      this.totalProcs -= 1;
    }
    debug && this.log('Total Procs: ' + this.totalProcs);
    debug && this.log('Used Procs: ' + this.usedProcs);
    debug && this.log('Unused Procs: ' + this.unusedProcs);
    debug && this.log('Refreshed Procs: ' + this.overwrittenProcs);
  }

  get wastedProcs() {
    return this.unusedProcs + this.overwrittenProcs;
  }

  get procsPerMinute() {
    return this.totalProcs / (this.owner.fightDuration / 60000);
  }

  get procUtilization() {
    return 1 - this.wastedProcs / this.totalProcs;
  }

  get procUtilizationThresholds() {
    return {
      actual: this.procUtilization,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get pyroclasmCombustionUsage() {
    return {
      actual: this.badPyroclasmDuringCombustion,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.procUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted {formatNumber(this.wastedProcs)} of your{' '}
          <SpellLink id={TALENTS.PYROCLASM_TALENT.id} /> procs. These procs make your hard cast (non
          instant) <SpellLink id={TALENTS.PYROBLAST_TALENT.id} /> casts deal {DAMAGE_MODIFIER}%
          extra damage, so try and use them as quickly as possible so they do not expire or get
          overwritten.
        </>,
      )
        .icon(TALENTS.PYROCLASM_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.pyroclasm.wastedProcs">
            {formatPercentage(this.procUtilization)}% utilization
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
    when(this.pyroclasmCombustionUsage).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You used your <SpellLink id={TALENTS.PYROCLASM_TALENT.id} /> proc during{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> {this.badPyroclasmDuringCombustion} times
          while you were capped or close to capping on <SpellLink id={SPELLS.FIRE_BLAST.id} /> or{' '}
          <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} />. While you do want to use your{' '}
          <SpellLink id={TALENTS.PYROCLASM_TALENT.id} /> procs during{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> if they are available, you should use some
          of your <SpellLink id={SPELLS.FIRE_BLAST.id} /> and{' '}
          <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} /> charges first to ensure you are not
          capping them and therefore wasting them. The only exception to this is if your{' '}
          <SpellLink id={TALENTS.PYROCLASM_TALENT.id} /> proc will expire before you can use your
          other charges.
        </>,
      )
        .icon(TALENTS.PYROCLASM_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.pyroclasm.pyroclasmCombustionUsage">
            {formatNumber(actual)} bad uses
          </Trans>,
        )
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is a measure of how well you utilized your Pyroclasm procs.
            <ul>
              <li>
                {this.procsPerMinute.toFixed(2)} Procs Per Minute ({this.totalProcs} Total)
              </li>
              <li>{formatNumber(this.usedProcs)} Procs used</li>
              <li>{formatNumber(this.unusedProcs)} Procs unused/expired</li>
              <li>{formatNumber(this.overwrittenProcs)} Procs overwritten</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.PYROCLASM_TALENT.id}>
          <>
            {formatPercentage(this.procUtilization, 0)}% <small>Proc Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Pyroclasm;
