import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Events, { DamageEvent, AnyEvent } from 'parser/core/Events';
import MAGIC_SCHOOLS, { isMatchingDamageType } from 'game/MAGIC_SCHOOLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import spells from 'common/SPELLS/shaman';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import UptimeIcon from 'interface/icons/Uptime';

const DAMAGE_AMP_PERCENTAGE: Record<number, number> = { 1: 0.05, 2: 0.25 };

class LegacyOfTheFrostWitch extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  protected accumulatedSpend = 0;
  protected damageAmpPercentage = 0;
  protected extraDamage = 0;
  protected stormStrikeResets = 0;
  protected windStrikeResets = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.LEGACY_OF_THE_FROST_WITCH_TALENT);

    if (!this.active) {
      return;
    }

    this.damageAmpPercentage =
      DAMAGE_AMP_PERCENTAGE[
        this.selectedCombatant.getTalentRank(TALENTS_SHAMAN.LEGACY_OF_THE_FROST_WITCH_TALENT)
      ];

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(spells.LEGACY_OF_THE_FROST_WITCH_BUFF),
      this.onProcLegacyOfTheFrostWitch,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(spells.LEGACY_OF_THE_FROST_WITCH_BUFF),
      this.onProcLegacyOfTheFrostWitch,
    );
  }

  onDamage(event: DamageEvent) {
    if (
      this.selectedCombatant.hasBuff(spells.LEGACY_OF_THE_FROST_WITCH_BUFF.id) &&
      isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.PHYSICAL)
    ) {
      this.extraDamage += calculateEffectiveDamage(event, this.damageAmpPercentage);
    }
  }

  onProcLegacyOfTheFrostWitch(event: AnyEvent) {
    if (this.spellUsable.isOnCooldown(TALENTS_SHAMAN.STORMSTRIKE_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS_SHAMAN.STORMSTRIKE_TALENT.id, event.timestamp, true);
      if (!this.selectedCombatant.hasBuff(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id)) {
        this.stormStrikeResets += 1;
      }
    }

    if (this.spellUsable.isOnCooldown(spells.WINDSTRIKE_CAST.id)) {
      this.spellUsable.endCooldown(spells.WINDSTRIKE_CAST.id, event.timestamp, true);
      if (this.selectedCombatant.hasBuff(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id)) {
        this.windStrikeResets += 1;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {this.stormStrikeResets} Stormstrike resets
            <br />
            {this.windStrikeResets} Windstrike resets
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.LEGACY_OF_THE_FROST_WITCH_TALENT.id}>
          <>
            <ItemDamageDone amount={this.extraDamage} />
            <br />
            <UptimeIcon /> {formatNumber(
              this.stormStrikeResets + this.windStrikeResets,
            )} resets{' '}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LegacyOfTheFrostWitch;
