import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
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

const ACCEPTABLE_INITIAL_POST_PULL_USES_DELTA_MS = 4_000;

/**
 * Prescience is a core talent that buffs the target with 3% crit, as well
 * as making them a prio target for your Ebon Might buff.
 * It is an important spell to use on cooldown to maximize uptime,
 * as well as always targeting DPS players as to not get Ebon Might
 * on healers or tanks.
 * We will count tanks as an okay cast since situationally it might be
 * the right play.
 */

interface PrescienceCooldownCast extends CooldownTrigger<CastEvent> {
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

    // deactivate in M+ with Clairvoyant as no cases where casts can be counted as a fail
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.PRESCIENCE_TALENT) &&
      !(
        this.selectedCombatant.hasTalent(TALENTS.CLAIRVOYANT_TALENT) &&
        isMythicPlus(this.owner.fight)
      );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRESCIENCE_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  /** Remove Pre-Pull uses if they didn't prevent 2 Post-Pull uses.
   * Since Pre-Pull uses are cleared on combat start, they considered as bad usage,
   * but if they didn't prevent 2 Post-Pull uses, they aren't relevant enough to show. */
  onFightEnd() {
    const lastPrePullUseIdx = this.uses.findLastIndex((use) =>
      use.checklistItems.some((item) => item.timestamp < this.owner.fight.start_time),
    );
    if (lastPrePullUseIdx === -1) {
      return;
    }

    const secondPostPullUse = this.uses[lastPrePullUseIdx + 2];
    if (!secondPostPullUse) {
      return;
    }

    const delta = secondPostPullUse.event.timestamp - this.owner.fight.start_time;
    if (delta < ACCEPTABLE_INITIAL_POST_PULL_USES_DELTA_MS) {
      this.uses.splice(0, lastPrePullUseIdx + 1);
    }
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />
          </strong>{' '}
          is an ability that enhances the performance of DPS players by granting them Critical
          Strike chance and the damage multiplier <SpellLink spell={TALENTS.FATE_MIRROR_TALENT} />
          .
          <br />
          {this.selectedCombatant.hasTalent(TALENTS.CLAIRVOYANT_TALENT) && (
            <>
              With <SpellLink spell={TALENTS.CLAIRVOYANT_TALENT} /> talented,{' '}
              <SpellLink spell={TALENTS.MOTES_OF_POSSIBILITY_TALENT} /> have a chance to apply{' '}
              <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> to players who consume them. These
              uses are not included in this cast breakdown.
            </>
          )}
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
            with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. You should always try and buff DPS
            players.
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
      if (isMythicPlus(this.owner.fight)) {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            Buffed Tank: <span className={className}>{this.currentBuffedPlayer?.name}</span> with{' '}
            <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. This is situationally okay, but should
            be avoided. If you have an extra use of Prescience, such as due to{' '}
            <SpellLink spell={TALENTS.TIME_SKIP_TALENT} />, you should usually prioritise buffing
            yourself before the tank.
          </div>
        );
      } else {
        details = (
          <div>
            Buffed Tank: <span className={className}>{this.currentBuffedPlayer?.name}</span> with{' '}
            <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. You should always try and buff DPS
            players.
          </div>
        );
      }
    } else if (cast.onHealer) {
      details = (
        <div>
          Buffed Healer: <span className={className}>{this.currentBuffedPlayer?.name}</span> with{' '}
          <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. You should always try and buff DPS
          players.
        </div>
      );
    } else if (cast.onYourself) {
      if (isMythicPlus(this.owner.fight)) {
        performance = QualitativePerformance.Ok;
        details = (
          <div>
            Buffed: yourself with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. This is
            acceptable in Mythic+ if you have an extra use, such as due to{' '}
            <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> or{' '}
            <SpellLink spell={TALENTS.GOLDEN_OPPORTUNITY_TALENT} />, and both DPS already have
            Prescience active.
          </div>
        );
      } else {
        details = (
          <div>
            Buffed: yourself with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. You should always
            try and buff DPS players.
          </div>
        );
      }
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
        if (!isMythicPlus(this.owner.fight)) {
          const refreshPerformance = {
            performance: QualitativePerformance.Ok,
            summary: <div>Target already had Prescience</div>,
            details: (
              <div>
                Target already had <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active, since{' '}
                <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> doesn't pandemic you should always
                try to cast on a new target so you can keep more{' '}
                <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active.
              </div>
            ),
          };
          return refreshPerformance;
        } else {
          const refreshPerformance = {
            performance: QualitativePerformance.Good,
            summary: <div>Target already had Prescience</div>,
            details: (
              <div>
                Target already had <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> active. This is
                acceptable in Mythic+, since there's only two other DPS in the group.
              </div>
            ),
          };

          return refreshPerformance;
        }
      }
    }
  }

  private onCast(event: CastEvent) {
    let buffTarget;
    const relatedBuffEvents = getPrescienceBuffEvents(event);

    for (const buffEvent of relatedBuffEvents) {
      const targetID = buffEvent.targetID;
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
