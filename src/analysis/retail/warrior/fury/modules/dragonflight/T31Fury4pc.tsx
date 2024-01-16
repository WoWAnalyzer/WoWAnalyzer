import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { formatDuration } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import { TIERS } from 'game/TIERS';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateMaxCasts } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// https://www.wowhead.com/spell=422926/warrior-fury-10-2-class-set-4pc
const INTERNAL_COOLDOWN_MS = 500;
const COOLDOWN_REDUCTION_MS = 2500;

export default class T31Fury4Pc extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.has2PieceByTier(TIERS.T31) &&
      this.selectedCombatant.hasTalent(TALENTS.BLOODTHIRST_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.ODYNS_FURY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.BLOODTHIRST, SPELLS.BLOODBATH]),
      (event) => {
        this.onBloodthirstCast(event);
      },
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.BLOODTHIRST, SPELLS.BLOODBATH]),
      (event) => {
        this.onBloodthirstDamage(event);
      },
    );
  }

  has2P: boolean = false;
  has4P: boolean = false;

  wastedBloodthirsts = 0;
  procs = 0;
  lastProc = Number.MIN_SAFE_INTEGER;
  effectiveCDR = 0;

  private onBloodthirstCast(event: CastEvent) {
    if (!this.deps.spellUsable.isOnCooldown(SPELLS.ODYNS_FURY.id)) {
      this.wastedBloodthirsts += 1;
    }
  }

  private onBloodthirstDamage(event: DamageEvent) {
    const { spellUsable } = this.deps;

    if (
      spellUsable.isOnCooldown(SPELLS.ODYNS_FURY.id) &&
      event.hitType === HIT_TYPES.CRIT &&
      event.timestamp - this.lastProc > INTERNAL_COOLDOWN_MS
    ) {
      this.procs += 1;
      this.lastProc = event.timestamp;

      const effectiveReduction = spellUsable.reduceCooldown(
        SPELLS.ODYNS_FURY.id,
        COOLDOWN_REDUCTION_MS,
      );

      this.effectiveCDR += effectiveReduction;
    }
  }

  private extraOfCasts() {
    const baseCdSeconds = 0.001 * this.deps.spellUsable.fullCooldownDuration(SPELLS.ODYNS_FURY.id);

    const baseCasts = Math.floor(calculateMaxCasts(baseCdSeconds, this.owner.fightDuration));
    const reducedCasts = Math.floor(
      calculateMaxCasts(baseCdSeconds, this.owner.fightDuration + this.effectiveCDR),
    );

    return {
      baseCasts,
      reducedCasts,
      extraCasts: reducedCasts - baseCasts,
    };
  }

  statistic() {
    const { baseCasts, extraCasts } = this.extraOfCasts();

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.CORE(2)}
      >
        <BoringSpellValueText spell={SPELLS.T31_FURY_4P_BONUS}>
          <div>
            <SpellIcon spell={SPELLS.ODYNS_FURY.id} />{' '}
            <TooltipElement
              content={
                <>
                  <div>
                    <SpellLink spell={SPELLS.BLOODTHIRST} />/
                    <SpellLink spell={SPELLS.BLOODBATH} /> critically hit {this.procs} times,
                    resulting in a effective cooldown reduction of{' '}
                    {formatDuration(this.effectiveCDR)}.
                  </div>
                  <div>
                    Without cooldown reduction a total of {baseCasts}{' '}
                    <SpellLink spell={SPELLS.ODYNS_FURY} /> casts would have been possible, with the
                    cooldown reduction a total of {baseCasts + extraCasts} casts were possible.
                  </div>
                </>
              }
            >
              {Math.floor(extraCasts)}{' '}
              <small>
                extra <SpellLink spell={SPELLS.ODYNS_FURY} icon={false} /> casts
              </small>
            </TooltipElement>
          </div>
          <div>
            <SpellIcon spell={SPELLS.BLOODTHIRST.id} />{' '}
            <TooltipElement
              content={
                this.wastedBloodthirsts > 0 ? (
                  <>
                    By casting <SpellLink spell={SPELLS.BLOODTHIRST} />/
                    <SpellLink spell={SPELLS.BLOODBATH} /> while{' '}
                    <SpellLink spell={SPELLS.ODYNS_FURY} /> is <em>not</em> on cooldown, you wasted
                    a total of {this.wastedBloodthirsts} casts, since any critical hits would not
                    have reduced the cooldown of <SpellLink spell={SPELLS.ODYNS_FURY} />.
                  </>
                ) : (
                  <>
                    You always casted <SpellLink spell={SPELLS.BLOODTHIRST} />/
                    <SpellLink spell={SPELLS.BLOODBATH} /> while{' '}
                    <SpellLink spell={SPELLS.ODYNS_FURY} /> was on cooldown, meaning you did not
                    waste any cooldown reduction
                  </>
                )
              }
            >
              {this.wastedBloodthirsts}{' '}
              <small>
                "wasted" <SpellLink spell={SPELLS.BLOODTHIRST} icon={false} /> casts
              </small>
            </TooltipElement>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
