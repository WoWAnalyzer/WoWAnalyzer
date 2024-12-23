import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import Events, {
  DamageEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  EventType,
  RemoveBuffEvent,
} from 'parser/core/Events';
import MAGIC_SCHOOLS, { isMatchingDamageType } from 'game/MAGIC_SCHOOLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import SPELLS, { maybeGetSpell } from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SpellLink } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { DamageIcon, UptimeIcon } from 'interface/icons';
import Abilities from 'parser/core/modules/Abilities';
import { MERGE_SPELLS } from 'analysis/retail/shaman/enhancement/constants';
import typedKeys from 'common/typedKeys';

const DAMAGE_AMP_PERCENTAGE: Record<number, number> = { 1: 0.05, 2: 0.25 };
const debug = false;

/**
 * Consuming 10 stacks of Maelstrom Weapon will reset the cooldown of Stormstrike
 * and increases the damage of your Physical and Frost abilities by [5/25]% for 5 sec.
 *
 * Example Log:
 *
 */
class LegacyOfTheFrostWitch extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  protected accumulatedSpend = 0;
  protected damageAmpPercentage = 0;
  protected buffedSpells: Record<number, number> = {};
  protected stormStrikeResets = 0;
  protected windStrikeResets = 0;
  protected lastApply = 0;
  protected appliedDuration = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT);

    if (!this.active) {
      return;
    }

    this.damageAmpPercentage =
      DAMAGE_AMP_PERCENTAGE[
        this.selectedCombatant.getTalentRank(TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT)
      ];

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF),
      this.onProcLegacyOfTheFrostWitch,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF),
      this.onProcLegacyOfTheFrostWitch,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF),
      this.onRemoveBuff,
    );
  }

  onDamage(event: DamageEvent) {
    const ability =
      event.ability.guid === SPELLS.MELEE.id
        ? SPELLS.MELEE
        : this.abilities.getAbility(event.ability.guid);
    if (!ability || event.ability.guid === SPELLS.PRIMORDIAL_WAVE_DAMAGE.id) {
      // primordial wave is elemental damage but not increased by LotFW
      return;
    }
    if (
      this.selectedCombatant.hasBuff(SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF.id) &&
      (isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.PHYSICAL) ||
        isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.FROST))
    ) {
      if (event.amount > 0) {
        const spellId =
          MERGE_SPELLS.find((x) => x.SpellIds.includes(event.ability.guid))?.NewSpell ??
          event.ability.guid;
        if (!spellId) {
          return;
        }
        if (this.buffedSpells[spellId] === undefined) {
          this.buffedSpells[spellId] = 0;
        }
        this.buffedSpells[spellId] += calculateEffectiveDamage(event, this.damageAmpPercentage);
      }
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.appliedDuration += event.timestamp - this.lastApply!;
  }

  onProcLegacyOfTheFrostWitch(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.type === EventType.ApplyBuff) {
      this.lastApply = event.timestamp;
    }
    if (this.spellUsable.isOnCooldown(TALENTS.STORMSTRIKE_TALENT.id)) {
      debug &&
        console.log(
          `Stormstrike reset by Legacy of the Frost Witch at timestamp: ${
            event.timestamp
          } (${this.owner.formatTimestamp(event.timestamp, 3)})`,
        );
      this.spellUsable.endCooldown(TALENTS.STORMSTRIKE_TALENT.id, event.timestamp);
      if (!this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id)) {
        this.stormStrikeResets += 1;
      }
    }

    if (this.spellUsable.isOnCooldown(SPELLS.WINDSTRIKE_CAST.id)) {
      debug &&
        console.log(
          `Windstrike reset by Legacy of the Frost Witch at timestamp: ${
            event.timestamp
          } (${this.owner.formatTimestamp(event.timestamp, 3)})`,
        );
      this.spellUsable.endCooldown(SPELLS.WINDSTRIKE_CAST.id, event.timestamp);
      if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id)) {
        this.windStrikeResets += 1;
      }
    }
  }

  get uptime() {
    return this.appliedDuration / this.owner.fightDuration;
  }

  get extraDamage() {
    const spellList = typedKeys(this.buffedSpells).map((spellId) => this.buffedSpells[spellId]);
    if (spellList?.length > 0) {
      return spellList.reduce((current, total) => (total += current), 0);
    }
    return 0;
  }

  get spellBreakdown() {
    return (
      <>
        {typedKeys(this.buffedSpells).map((spellId) => {
          const spell = maybeGetSpell(spellId)!;
          return (
            <li key={spellId}>
              <SpellLink spell={spell} /> -{' '}
              <strong>{formatNumber(this.buffedSpells[spell.id])}</strong>
            </li>
          );
        })}
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Reset breakdown:
            <ul>
              <li>
                <strong>{this.stormStrikeResets}</strong>{' '}
                <SpellLink spell={TALENTS.STORMSTRIKE_TALENT} /> resets
              </li>
              <li>
                <strong>{this.windStrikeResets}</strong>{' '}
                <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> resets
              </li>
            </ul>
            Buff details:
            <ul>
              <li>
                <UptimeIcon /> <strong>{formatPercentage(this.uptime)}</strong> % uptime
              </li>
              <li>
                <DamageIcon /> <strong>{formatNumber(this.extraDamage)}</strong> added damage
              </li>
            </ul>
            Spell breakdown:
            <ul>{this.spellBreakdown}</ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT}>
          <>
            <ItemDamageDone amount={this.extraDamage} />
            <br />
            <UptimeIcon /> {formatNumber(this.stormStrikeResets + this.windStrikeResets)}{' '}
            <small>resets</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LegacyOfTheFrostWitch;
