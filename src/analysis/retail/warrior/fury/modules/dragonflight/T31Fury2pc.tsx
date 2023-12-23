import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { formatNumber } from 'common/format';
import { TIERS } from 'game/TIERS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
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
      () => (this.boostedOdynsFuryCount += 1),
    );
    if (this.selectedCombatant.hasTalent(TALENTS.TITANS_TORMENT_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_SHARED),
        () => (this.boostedTitansTormentCount += 1),
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
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.BLOODTHIRST, SPELLS.BLOODBATH]),
      this.bloodthirstDamage,
    );
  }

  boostedTitansTormentCount = 0;
  boostedOdynsFuryCount = 0;
  boostedOdynsFuryDamage = 0;
  boostedBloodthirstCount = 0;
  boostedBloodthirstDamage = 0;

  mainTarget: { id: number; instance?: number } | null = null;

  private odynsFuryDamage(event: DamageEvent) {
    this.boostedOdynsFuryDamage += calculateEffectiveDamage(event, ODYNS_FURY_DMG_INCREASE);
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

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={
          <>
            <div>
              A total of {this.boostedOdynsFuryCount + this.boostedTitansTormentCount}{' '}
              {this.boostedTitansTormentCount > 0 ? (
                <>
                  ({this.boostedOdynsFuryCount} <SpellLink spell={SPELLS.ODYNS_FURY} /> +{' '}
                  {this.boostedTitansTormentCount}{' '}
                  <SpellLink spell={TALENTS.TITANS_TORMENT_TALENT} />)
                </>
              ) : (
                ''
              )}{' '}
              casts was increased with a total of {formatNumber(this.boostedOdynsFuryDamage)}{' '}
              damage.
            </div>
            <div>
              A total of {this.boostedBloodthirstCount} <SpellLink spell={SPELLS.BLOODTHIRST} />/
              <SpellLink spell={SPELLS.BLOODBATH} /> casts was increased with a total of{' '}
              {formatNumber(this.boostedBloodthirstDamage)} damage.{' '}
              <b>This does not account for the incrreased crit chance!</b>
            </div>
            <div>
              These combined for a total of{' '}
              {formatNumber(this.boostedBloodthirstDamage + this.boostedOdynsFuryDamage)} damage.
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.T31_FURY_2P_BONUS}>
          <ItemDamageDone amount={this.boostedBloodthirstDamage + this.boostedOdynsFuryDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
