import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, { CastEvent } from 'parser/core/Events';
import {
  getDisintegrateDamageEvents,
  getDisintegrateTargetCount,
  isFromMassDisintegrate,
} from 'analysis/retail/evoker/devastation/modules/normalizers/CastLinkNormalizer';
import Enemies from 'parser/shared/modules/Enemies';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  MASS_DISINTEGRATE_MULTIPLIER_PER_MISSING_TARGET,
  MASS_ERUPTION_MULTIPLIER_PER_MISSING_TARGET,
} from 'analysis/retail/evoker/shared/constants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import { InformationIcon, WarningIcon } from 'interface/icons';
import {
  getEruptionDamageEvents,
  getMassEruptionDamageEvents,
  isFromMassEruption,
} from 'analysis/retail/evoker/augmentation/modules/normalizers/CastLinkNormalizer';

const MAX_TARGETS = 3;
const BUFF_EVENTS = [Events.applybuff, Events.applybuffstack];

/**
 * Empower spells cause your next Disintegrate/Eruption to strike up to 3 targets.
 * When striking less than 3 targets, Disintegrate damage is increased by 15% for each missing target.
 */
class MassDisintegrate extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  buffCount = 0;
  castCount = 0;
  targetCount = 0;
  damageFromAmp = 0;
  damageFromExtraTargets = 0;
  isDevastation = false;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.ERUPTION_TALENT);
    this.isDevastation = this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DISINTEGRATE),
      this.onDisintegrateCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onEruptionCast,
    );

    BUFF_EVENTS.forEach((event) =>
      this.addEventListener(
        event.by(SELECTED_PLAYER).spell([SPELLS.MASS_DISINTEGRATE_BUFF, SPELLS.MASS_ERUPTION_BUFF]),
        this.onBuff,
      ),
    );
  }

  onBuff() {
    this.buffCount += 1;
  }

  onEruptionCast(event: CastEvent) {
    if (!isFromMassEruption(event)) {
      return;
    }
    this.castCount += 1;

    const eruptionDamageEvents = getEruptionDamageEvents(event);
    const massEruptionDamageEvents = getMassEruptionDamageEvents(event);

    const targetCount = Math.min(MAX_TARGETS, eruptionDamageEvents.length);
    this.targetCount += targetCount;

    if (targetCount < MAX_TARGETS) {
      eruptionDamageEvents.forEach((damageEvent) => {
        this.damageFromAmp += calculateEffectiveDamage(
          damageEvent,
          MASS_ERUPTION_MULTIPLIER_PER_MISSING_TARGET * (MAX_TARGETS - targetCount),
        );
      });

      massEruptionDamageEvents.forEach((damageEvent) => {
        const extraAmpDamage = calculateEffectiveDamage(
          damageEvent,
          MASS_ERUPTION_MULTIPLIER_PER_MISSING_TARGET * (MAX_TARGETS - targetCount),
        );

        this.damageFromAmp += extraAmpDamage;
        this.damageFromExtraTargets +=
          damageEvent.amount + (damageEvent.absorbed || 0) - extraAmpDamage;
      });

      return;
    }

    this.damageFromExtraTargets += massEruptionDamageEvents.reduce((total, damageEvent) => {
      return total + damageEvent.amount + (damageEvent.absorbed || 0);
    }, 0);
  }

  onDisintegrateCast(event: CastEvent) {
    if (!isFromMassDisintegrate(event)) {
      return;
    }
    this.castCount += 1;

    const targetCount = getDisintegrateTargetCount(event);
    this.targetCount += targetCount;

    const castTarget = this.enemies.getEntity(event);
    const damageEvents = getDisintegrateDamageEvents(event);

    damageEvents.forEach((damageEvent) => {
      const target = this.enemies.getEntity(damageEvent);
      if (target === castTarget && targetCount < MAX_TARGETS) {
        this.damageFromAmp += calculateEffectiveDamage(
          damageEvent,
          MASS_DISINTEGRATE_MULTIPLIER_PER_MISSING_TARGET * (MAX_TARGETS - targetCount),
        );
        return;
      }

      this.damageFromExtraTargets += damageEvent.amount + (damageEvent.absorbed || 0);
    });
  }

  get averageTargets() {
    return this.targetCount / this.castCount;
  }

  get wastedBuffs() {
    return this.buffCount - this.castCount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Damage from amp: {formatNumber(this.damageFromAmp)}</li>
            <li>Damage from extra targets: {formatNumber(this.damageFromExtraTargets)}</li>
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink
              spell={
                this.isDevastation ? TALENTS.MASS_DISINTEGRATE_TALENT : TALENTS.MASS_ERUPTION_TALENT
              }
            />
          </label>

          <strong>Damage from amp:</strong>
          <div className="value">
            <ItemDamageDone amount={this.damageFromAmp} />
          </div>

          <strong>Damage from extra targets:</strong>
          <div className="value">
            <ItemDamageDone amount={this.damageFromExtraTargets} />
          </div>

          <div className="value">
            <InformationIcon /> {this.averageTargets.toFixed(2)}
            <small> average targets per cast</small>
          </div>

          {this.wastedBuffs > 0 && (
            <div className="value">
              <WarningIcon /> {this.wastedBuffs}{' '}
              <small>
                <SpellLink
                  spell={
                    this.isDevastation ? SPELLS.MASS_DISINTEGRATE_BUFF : SPELLS.MASS_ERUPTION_BUFF
                  }
                />{' '}
                wasted
              </small>
            </div>
          )}
        </div>
      </Statistic>
    );
  }
}

export default MassDisintegrate;
