import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, {
  DamageEvent,
  EmpowerEndEvent,
  GetRelatedEvents,
  ApplyBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  MID1_AUGMENTATION_4PC_DAMAGE_MULTIPLIER,
  MID1_AUGMENTATION_4PC_CDR_MULTIPLIER,
} from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';
import { formatNumber } from 'common/format';
import { UPHEAVAL_REVERBERATION_DAM_LINK } from '../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * (4) Set Augmentation: While Ebon Might is active, empower spells deal 20% increased damage and cool down 20% faster.
 */
class MID1Augmentation2P extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  extraDamage = 0;
  //Shouldn't be needed, but Blizzard...
  isEbonMightActive = false;

  currentFireBreath = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT)
    ? SPELLS.FIRE_BREATH_FONT
    : SPELLS.FIRE_BREATH;

  currentUpheaval = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT)
    ? SPELLS.UPHEAVAL_FONT
    : SPELLS.UPHEAVAL;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.MID1);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FIRE_BREATH_DOT, SPELLS.UPHEAVAL_DAM]),
      this.onDamage,
    );
    if (this.selectedCombatant.hasTalent(TALENTS.REVERBERATIONS_TALENT)) {
      this.addEventListener(
        Events.empowerEnd
          .by(SELECTED_PLAYER)
          .spell([TALENTS.UPHEAVAL_TALENT, SPELLS.UPHEAVAL_FONT]),
        this.onUpheavalCast,
      );
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onRemoveBuff,
    );
  }

  onDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL)) {
      this.extraDamage += calculateEffectiveDamage(event, MID1_AUGMENTATION_4PC_DAMAGE_MULTIPLIER);
    }
  }

  onUpheavalCast(event: EmpowerEndEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL)) {
      const reverbEvents = GetRelatedEvents<DamageEvent>(event, UPHEAVAL_REVERBERATION_DAM_LINK);
      reverbEvents.forEach((reverbEvent) => {
        this.extraDamage += calculateEffectiveDamage(
          reverbEvent,
          MID1_AUGMENTATION_4PC_DAMAGE_MULTIPLIER,
        );
      });
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (!this.isEbonMightActive) {
      this.spellUsable.applyCooldownRateChange(
        this.currentFireBreath.id,
        MID1_AUGMENTATION_4PC_CDR_MULTIPLIER,
      );
      this.spellUsable.applyCooldownRateChange(
        this.currentUpheaval.id,
        MID1_AUGMENTATION_4PC_CDR_MULTIPLIER,
      );
      this.isEbonMightActive = true;
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (this.isEbonMightActive) {
      this.spellUsable.removeCooldownRateChange(
        this.currentFireBreath.id,
        MID1_AUGMENTATION_4PC_CDR_MULTIPLIER,
      );
      this.spellUsable.removeCooldownRateChange(
        this.currentUpheaval.id,
        MID1_AUGMENTATION_4PC_CDR_MULTIPLIER,
      );
      this.isEbonMightActive = false;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.extraDamage)}</li>
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink spell={SPELLS.FIRE_BREATH} /> and{' '}
            <SpellLink spell={TALENTS.UPHEAVAL_TALENT} /> damage from tier
          </label>
          <ItemDamageDone amount={this.extraDamage} />
        </div>
      </Statistic>
    );
  }
}

export default MID1Augmentation2P;
