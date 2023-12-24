import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { formatNumber, formatPercentage } from 'common/format';
import { TIERS } from 'game/TIERS';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { Ability, CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

// https://www.wowhead.com/spell=422925/warrior-fury-10-2-class-set-2pc
const ODYNS_FURY_DMG_INCREASE = 0.5; // 50% increase
const BLOODTHIRST_DMG_INCREASE = 1.5; // 150% increase

export default class T31Fury2pc extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.has2PieceByTier(TIERS.T31) &&
      (this.selectedCombatant.hasTalent(TALENTS.ODYNS_FURY_TALENT) ||
        this.selectedCombatant.hasTalent(TALENTS.TITANS_TORMENT_TALENT));

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ODYNS_FURY),
      this.odynsFuryCast,
    );
    if (this.selectedCombatant.hasTalent(TALENTS.TITANS_TORMENT_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_SHARED),
        this.avatarCast,
      );
    }
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ODYNS_FURY, SPELLS.ODYNS_FURY_1, SPELLS.ODYNS_FURY_2, SPELLS.ODYNS_FURY_3]),
      this.odynsFuryDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.BLOODTHIRST, SPELLS.BLOODBATH]),
      this.bloodthirstCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOODTHIRST),
      this.bloodthirstDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOODBATH),
      this.bloodbathDamage,
    );
  }

  /**
   * Track if we cast Avatar or Odyns Fury last. This is to correctly track boosted damage to Titans Torment.
   */
  lastOFCast: Ability | null = null;
  boostedTitansTormentCount = 0;
  boostedTitansTormentDamage = 0;
  boostedOdynsFuryCount = 0;
  boostedOdynsFuryDamage = 0;
  boostedBloodthirstCount = 0;
  boostedBloodthirstDamage = 0;
  boostedBloodbathCount = 0;
  boostedBloodbathDamage = 0;

  mainTarget: { id: number; instance?: number } | null = null;

  private odynsFuryCast(event: CastEvent) {
    this.boostedOdynsFuryCount += 1;
    this.lastOFCast = event.ability;
  }

  private avatarCast(event: CastEvent) {
    this.boostedTitansTormentCount += 1;
    this.lastOFCast = event.ability;
  }

  private odynsFuryDamage(event: DamageEvent) {
    if (this.lastOFCast?.guid === SPELLS.AVATAR_SHARED.id) {
      this.boostedTitansTormentDamage += calculateEffectiveDamage(event, ODYNS_FURY_DMG_INCREASE);
    } else {
      this.boostedOdynsFuryDamage += calculateEffectiveDamage(event, ODYNS_FURY_DMG_INCREASE);
    }
  }

  private bloodthirstCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.FURIOUS_BLOODTHIRST.id)) {
      if (event.targetID == null) {
        console.error('Bloodthirst cast without target', event);
        return;
      }

      // If bloodthirst is cast with Furious Bloodthirst (2pc buff), we know damage to _main_ target
      // will be increased by 150%.
      this.mainTarget = {
        id: event.targetID,
        instance: event.targetInstance,
      };
    }
  }

  private bloodthirstDamage(event: DamageEvent) {
    // If damage is done to the main target after casting bloodthirst with buff, we count damage.
    if (
      this.mainTarget !== null &&
      event.targetID === this.mainTarget.id &&
      event.targetInstance === this.mainTarget.instance
    ) {
      this.boostedBloodthirstCount += 1;
      this.boostedBloodthirstDamage += calculateEffectiveDamage(event, BLOODTHIRST_DMG_INCREASE);
      this.mainTarget = null;
    }
  }

  private bloodbathDamage(event: DamageEvent) {
    // If damage is done to the main target after casting bloodbath with buff, we count damage.
    if (
      this.mainTarget !== null &&
      event.targetID === this.mainTarget.id &&
      event.targetInstance === this.mainTarget.instance
    ) {
      this.boostedBloodbathCount += 1;
      this.boostedBloodbathDamage += calculateEffectiveDamage(event, BLOODTHIRST_DMG_INCREASE);
      this.mainTarget = null;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={
          <>
            <div>
              All <SpellLink spell={SPELLS.ODYNS_FURY} /> deal{' '}
              {formatPercentage(ODYNS_FURY_DMG_INCREASE, 0)}% more damage.
            </div>
            <div>
              After each <SpellLink spell={SPELLS.ODYNS_FURY} />, the following 3{' '}
              <SpellLink spell={SPELLS.BLOODTHIRST} />{' '}
              {this.selectedCombatant.hasTalent(TALENTS.RECKLESS_ABANDON_TALENT) ? (
                <>
                  {' '}
                  or <SpellLink spell={SPELLS.BLOODBATH} />
                </>
              ) : (
                ''
              )}{' '}
              deal {formatPercentage(BLOODTHIRST_DMG_INCREASE, 0)}% increased damage and have 100%
              increased crit chance. Attacks cleaved to other targets with{' '}
              <SpellLink spell={TALENTS.IMPROVED_WHIRLWIND_TALENT} /> is not affected.
            </div>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Spell</th>
                  <th>Affected Casts</th>
                  <th>Damage Gained</th>
                </tr>
              </thead>
              <tbody>
                {this.boostedOdynsFuryCount > 0 && (
                  <tr>
                    <td>
                      <SpellLink spell={SPELLS.ODYNS_FURY} />
                    </td>
                    <td>{this.boostedOdynsFuryCount}</td>
                    <td>{formatNumber(this.boostedOdynsFuryDamage)}</td>
                  </tr>
                )}
                {this.boostedTitansTormentCount > 0 && (
                  <tr>
                    <td>
                      <SpellLink spell={TALENTS.TITANS_TORMENT_TALENT} />
                    </td>
                    <td>{this.boostedTitansTormentCount}</td>
                    <td>{formatNumber(this.boostedTitansTormentDamage)}</td>
                  </tr>
                )}
                {this.boostedBloodbathCount > 0 && (
                  <tr>
                    <td>
                      <SpellLink spell={SPELLS.BLOODBATH} />
                    </td>
                    <td>{this.boostedBloodbathCount}</td>
                    <td>{formatNumber(this.boostedBloodbathDamage)}*</td>
                  </tr>
                )}
                <tr>
                  <td>
                    <SpellLink spell={SPELLS.BLOODTHIRST} />
                  </td>
                  <td>{this.boostedBloodthirstCount}</td>
                  <td>
                    {formatNumber(this.boostedBloodthirstDamage)}
                    {this.boostedBloodthirstDamage > 0 ? '*' : ''}
                  </td>
                </tr>
                <tr>
                  <th>Total</th>
                  <th></th>
                  <th>
                    {formatNumber(
                      this.boostedBloodthirstDamage +
                        this.boostedBloodbathDamage +
                        this.boostedOdynsFuryDamage +
                        this.boostedTitansTormentDamage,
                    )}
                  </th>
                </tr>
              </tbody>
            </table>
            <div>* increased damage does not account for the increased crit chance</div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.T31_FURY_2P_BONUS}>
          <ItemDamageDone
            amount={
              this.boostedBloodthirstDamage +
              this.boostedBloodbathDamage +
              this.boostedOdynsFuryDamage
            }
          />
          {this.boostedBloodthirstCount > 0 &&
          this.selectedCombatant.hasTalent(TALENTS.RECKLESS_ABANDON_TALENT) ? (
            <div>
              <SpellIcon spell={SPELLS.BLOODTHIRST.id} />{' '}
              <TooltipElement
                content={
                  <>
                    Since the damage increase is multiplicative, try to use{' '}
                    <SpellLink spell={SPELLS.FURIOUS_BLOODTHIRST} /> on{' '}
                    <SpellLink spell={SPELLS.BLOODBATH} /> for more damage.
                  </>
                }
              >
                {this.boostedBloodthirstCount}
                <small>
                  {' '}
                  boosted <SpellLink spell={SPELLS.BLOODTHIRST} icon={false} /> casts.
                </small>
              </TooltipElement>
            </div>
          ) : (
            ''
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
