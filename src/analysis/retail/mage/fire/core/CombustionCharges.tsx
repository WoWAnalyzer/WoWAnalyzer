import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CooldownHistory from 'parser/shared/modules/CooldownHistory';
import EventHistory from 'parser/shared/modules/EventHistory';

class CombustionCharges extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
    cooldownHistory: CooldownHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;
  protected cooldownHistory!: CooldownHistory;

  hasFlameOn: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT);

  lowFireBlastCharges = () => {
    const maxFireBlastCharges = 1 + this.selectedCombatant.getTalentRank(TALENTS.FLAME_ON_TALENT);
    let casts = this.eventHistory.getEvents(EventType.Cast, {
      searchBackwards: true,
      spell: TALENTS.COMBUSTION_TALENT,
    });

    //Filter out casts where the player was capped or almost capped on charges
    casts = casts.filter(
      (cast) =>
        this.cooldownHistory.chargesAvailable(SPELLS.FIRE_BLAST.id, cast.timestamp) <
        maxFireBlastCharges - 1,
    );

    //Highlight bad casts
    const tooltip =
      'This Combustion was cast with a low amount of Fire Blast and/or Phoenix Flames charges.';
    casts.forEach((cast) => highlightInefficientCast(cast, tooltip));

    return casts.length;
  };

  lowPhoenixFlamesCharges = () => {
    this.log(this.selectedCombatant.getTalentRank(TALENTS.CALL_OF_THE_SUN_KING_TALENT));
    const maxPhoenixFlamesCharges =
      2 + this.selectedCombatant.getTalentRank(TALENTS.CALL_OF_THE_SUN_KING_TALENT);
    let casts = this.eventHistory.getEvents(EventType.Cast, {
      searchBackwards: true,
      spell: TALENTS.COMBUSTION_TALENT,
    });

    //Filter out casts where the player was capped or almost capped on charges
    casts = casts.filter(
      (cast) =>
        this.cooldownHistory.chargesAvailable(TALENTS.PHOENIX_FLAMES_TALENT.id, cast.timestamp) <
        maxPhoenixFlamesCharges - 1,
    );

    //Highlight bad casts
    const tooltip =
      'This Combustion was cast with a low amount of Fire Blast and/or Phoenix Flames charges.';
    casts.forEach((cast) => highlightInefficientCast(cast, tooltip));

    return casts.length;
  };

  get phoenixFlamesChargeUtil() {
    return (
      1 -
      this.lowPhoenixFlamesCharges() /
        this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts
    );
  }

  get fireBlastChargeUtil() {
    return (
      1 -
      this.lowFireBlastCharges() /
        this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts
    );
  }

  get phoenixFlamesThresholds() {
    return {
      actual: this.phoenixFlamesChargeUtil,
      isLessThan: {
        minor: 1,
        average: 0.65,
        major: 0.45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get fireBlastThresholds() {
    return {
      actual: this.fireBlastChargeUtil,
      isLessThan: {
        minor: 1,
        average: 0.65,
        major: 0.45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.phoenixFlamesThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> {this.lowPhoenixFlamesCharges()}{' '}
          times with less than 2 charges of <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} />.
          Make sure you are saving at least 2 charges while Combustion is on cooldown so you can get
          as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustionCharges.phoenixFlames.utilization">
            {formatPercentage(this.phoenixFlamesChargeUtil)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)} is recommended`),
    );
    when(this.fireBlastThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> {this.lowFireBlastCharges()}{' '}
          times with less than{' '}
          {this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT.id) ? '2' : '1'} charges of{' '}
          <SpellLink id={SPELLS.FIRE_BLAST.id} />. Make sure you are saving at least{' '}
          {this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT.id) ? '2' : '1'} charges while
          Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} />{' '}
          procs as possible before Combustion ends.
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustionCharges.flameOn.utilization">
            {formatPercentage(this.fireBlastChargeUtil)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)} is recommended`),
    );
  }
}
export default CombustionCharges;
