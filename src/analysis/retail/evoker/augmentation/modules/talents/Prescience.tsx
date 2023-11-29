import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import TALENTS from 'common/TALENTS/evoker';
import classColor from 'game/classColor';
import Events, { CastEvent, EventType } from 'parser/core/Events';
import { ReactNode } from 'react';
import { SpellLink } from 'interface';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ROLES from 'game/ROLES';
import Combatants from 'parser/shared/modules/Combatants';
import { getPrescienceBuffEvents } from '../normalizers/CastLinkNormalizer';
import Combatant from 'parser/core/Combatant';
import SPECS from 'game/SPECS';
import { isMythicPlus } from 'common/isMythicPlus';

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
    const rolePerformance = this.getRolePerformance(cast);

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'buffed-casts',
        timestamp: cast.event.timestamp,
        ...rolePerformance,
      },
    ];

    /** Since m+ is pretty payphoning I'll skip the step there since at worst you payphone it when you have two active and it might hit healer */
    if (!isMythicPlus(this.owner.fight)) {
      const castTargetPerformance = this.getCastTargetPerformance(cast);
      checklistItems.push({
        check: 'cast-target-performance',
        timestamp: cast.event.timestamp,
        ...castTargetPerformance,
      });
    }

    if (cast.event.timestamp < this.owner.fight.start_time) {
      const prePullPerformance = {
        performance: QualitativePerformance.Fail,
        summary: <div>Cast pre-pull</div>,
        details: (
          <div>
            You cast <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> pre-pull! This is very bad
            since with latest changes <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> gets cleared
            on combat start!
          </div>
        ),
      };

      checklistItems.push({
        check: 'pre-pull-performance',
        timestamp: cast.event.timestamp,
        ...prePullPerformance,
      });
    }

    const refreshPerformance = this.getRefreshPerformance(cast);
    if (refreshPerformance) {
      checklistItems.push({
        check: 'refresh-performance',
        timestamp: cast.event.timestamp,
        ...refreshPerformance,
      });
    }

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

  private getRolePerformance(cast: PrescienceCooldownCast) {
    const className = this.currentBuffedPlayer ? classColor(this.currentBuffedPlayer) : '';
    let performance = QualitativePerformance.Fail;

    const summary = <div>Buffed a DPS</div>;
    let details = (
      <div>
        You somehow managed to buff nothing with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />.
      </div>
    );

    if (cast.onDPS) {
      // Bonk players for buffing other Augs
      if (this.currentBuffedPlayer?.spec === SPECS.AUGMENTATION_EVOKER) {
        performance = QualitativePerformance.Fail;
        details = (
          <div>
            Buffed Augmentation: <span className={className}>{this.currentBuffedPlayer?.name}</span>{' '}
            with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. This should never happen! Make
            sure you position yourself better to avoid this.
          </div>
        );
      } else {
        performance = QualitativePerformance.Good;
        details = (
          <div>
            Buffed DPS: <span className={className}>{this.currentBuffedPlayer?.name}</span> with{' '}
            <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. Good job!
          </div>
        );
      }
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
          try and buff DPS players. Make sure to position yourself so you buff the intended players.
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

  private getCastTargetPerformance(cast: PrescienceCooldownCast) {
    const players = Object.values(this.combatants.players);

    const npcs = Object.values(this.owner.report.enemies);

    const castTargetIsPlayer = players.find((player) => player.id === cast.event.targetID);
    const castTargetIsNPC = npcs.find((npc) => npc.id === cast.event.targetID);

    const className = castTargetIsPlayer?.spec ? classColor(castTargetIsPlayer?.spec) : '';

    const targetPerformance = castTargetIsPlayer
      ? QualitativePerformance.Good
      : QualitativePerformance.Ok;

    const targetDetails = castTargetIsPlayer ? (
      <div>
        Player: <span className={className}>{castTargetIsPlayer.name}</span> was cast target. Good
        job!
      </div>
    ) : castTargetIsNPC ? (
      <div>
        NPC: <span className="npc">{castTargetIsNPC.name}</span> was cast target. You should always
        try not to proxy-cast your <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> to ensure you
        buff correct targets!
      </div>
    ) : (
      <div>
        Cast target was a NPC. You should always try not to proxy-cast your{' '}
        <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> to ensure you buff correct targets!
      </div>
    );

    const performanceCheck = {
      performance: targetPerformance,
      summary: <div>Cast on specific target</div>,
      details: targetDetails,
    };

    return performanceCheck;
  }

  private getRefreshPerformance(cast: PrescienceCooldownCast) {
    if (cast.event._linkedEvents) {
      if (cast.event._linkedEvents[0].event.type === EventType.RefreshBuff) {
        const refreshPerformance = {
          performance: QualitativePerformance.Ok,
          summary: <div>Target already had Prescience</div>,
          details: (
            <div>
              Target already had <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active, since{' '}
              <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> doesn't pandemic you should always try
              to cast on a new target so you can keep more{' '}
              <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active.
            </div>
          ),
        };

        return refreshPerformance;
      }
    }
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

    if (event.prepull) {
      buffTarget = event.targetID;
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
