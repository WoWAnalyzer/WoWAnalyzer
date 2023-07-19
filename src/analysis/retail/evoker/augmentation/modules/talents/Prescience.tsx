import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import TALENTS from 'common/TALENTS/evoker';
import Events, { CastEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import { SpellLink } from 'interface';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ROLES from 'game/ROLES';
import Combatants from 'parser/shared/modules/Combatants';
import { getPrescienceBuffEvents } from '../normalizers/CastLinkNormalizer';
import Combatant from 'parser/core/Combatant';

/**
 * Prescience is a core talent that buffs the target with 3% crit, as well
 * as making them a prio target for your Ebon Might buff.
 * It is an important spell to use on cooldown to maximize uptime,
 * as well as always targeting DPS players as to not get Ebon Might
 * on healers or tanks.
 * We will count tanks as an okay cast since situationally it might be
 * the right play.
 */

interface PrescienceCooldownCast extends SpellCast {
  onDPS: boolean;
  onHealer: boolean;
  onTank: boolean;
  onYourself: boolean;
}

class Prescience extends MajorCooldown<PrescienceCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  private currentBuffedPlayer: Combatant | undefined;

  constructor(options: Options) {
    super({ spell: TALENTS.PRESCIENCE_TALENT }, options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRESCIENCE_TALENT),
      this.onCast,
    );
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />
          </strong>{' '}
          is a skill that enhances the performance of DPS players by granting them Critical Strike
          chance and the damage multiplier <SpellLink spell={TALENTS.FATE_MIRROR_TALENT} />. It can
          be applied to up to two players simultaneously.{' '}
          <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> prioritizes targets with{' '}
          <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />, enabling you to select two recipients of
          the buff regardless of their position.
        </p>
      </>
    );
  }

  explainPerformance(cast: PrescienceCooldownCast): SpellUse {
    const prescienceWindowCastPerformance = this.prescienceWindowCastPerformance(cast);
    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'buffed-casts',
        timestamp: cast.event.timestamp,
        ...prescienceWindowCastPerformance,
      },
    ];

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );
    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: actualPerformance,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  private prescienceWindowCastPerformance(cast: PrescienceCooldownCast): UsageInfo {
    const className = this.currentBuffedPlayer?.spec?.className.replace(/\s/g, '') ?? '';
    let performance = QualitativePerformance.Fail;
    const summary = <div>Buffed a DPS</div>;
    let details = (
      <div>
        You somehow managed to buff nothing with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />.
      </div>
    );

    if (cast.onDPS) {
      performance = QualitativePerformance.Good;
      details = (
        <div>
          Buffed DPS: <span className={className}>{this.currentBuffedPlayer?.name}</span> with{' '}
          <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. Good job!
        </div>
      );
    } else if (cast.onTank) {
      performance = QualitativePerformance.Ok;
      details = (
        <div>
          Buffed Tank: <span className={className}>{this.currentBuffedPlayer?.name}</span> with{' '}
          <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. This is situationally okay, but should be
          avoided.
        </div>
      );
    } else if (cast.onHealer) {
      details = (
        <div>
          Buffed Healer: <span className={className}>{this.currentBuffedPlayer?.name}</span> with{' '}
          <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. You should always try and buff DPS
          players.
        </div>
      );
    } else if (cast.onYourself) {
      details = (
        <div>
          Buffed: yourself with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. You should always
          try and buff DPS players.
        </div>
      );
    } else {
      details = (
        <div>
          You somehow managed to buff nothing with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />.
          Most likely you buffed a friendly NPC.
        </div>
      );
    }
    return {
      performance: performance,
      summary: summary,
      details: details,
    };
  }

  private onCast(event: CastEvent) {
    let buffTarget;
    const relatedBuffEvents = getPrescienceBuffEvents(event);

    for (let i = 0; i < relatedBuffEvents.length; i = i + 1) {
      const targetID = relatedBuffEvents[i].targetID;
      if (this.combatants.players[targetID]) {
        buffTarget = targetID;
        break;
      }
    }

    // If somehow the Prescience cast didn't actually buff a player return early
    if (!buffTarget) {
      this.recordCooldown({
        event,
        onDPS: false,
        onHealer: false,
        onTank: false,
        onYourself: false,
      });
      return;
    }

    const buffedPlayer = this.combatants.players[buffTarget];
    this.currentBuffedPlayer = buffedPlayer;

    if (buffedPlayer?.spec?.role === ROLES.HEALER) {
      this.recordCooldown({
        event,
        onDPS: false,
        onHealer: true,
        onTank: false,
        onYourself: false,
      });
    } else if (buffedPlayer?.spec?.role === ROLES.TANK) {
      this.recordCooldown({
        event,
        onDPS: false,
        onHealer: false,
        onTank: true,
        onYourself: false,
      });
    } else if (buffTarget === this.owner.info.playerId) {
      this.recordCooldown({
        event,
        onDPS: false,
        onHealer: false,
        onTank: false,
        onYourself: true,
      });
    } else {
      this.recordCooldown({
        event,
        onDPS: true,
        onHealer: false,
        onTank: false,
        onYourself: false,
      });
    }
  }
}

export default Prescience;
