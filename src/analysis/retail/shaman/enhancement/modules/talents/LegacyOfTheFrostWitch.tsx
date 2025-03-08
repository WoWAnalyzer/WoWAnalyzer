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
import SPELLS from 'common/SPELLS/shaman';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SpellLink } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { DamageIcon, UptimeIcon } from 'interface/icons';
import Abilities from 'parser/core/modules/Abilities';
import {
  LOTFW_DAMAGE_AMP_PERCENTAGE,
  MERGE_SPELLS,
} from 'analysis/retail/shaman/enhancement/constants';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { Uptime } from 'parser/ui/UptimeBar';

const debug = false;

/**
 * Consuming 10 stacks of Maelstrom Weapon will reset the cooldown of Stormstrike
 * and increases the damage of your Physical and Frost abilities by [15/25]% for 8 sec.
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
      LOTFW_DAMAGE_AMP_PERCENTAGE[
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
    if (this.selectedCombatant.hasBuff(SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF.id)) {
      const multiplier =
        Math.pow(
          1 + this.damageAmpPercentage,
          (isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.PHYSICAL) ? 1 : 0) +
            (isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.FROST) ? 1 : 0),
        ) - 1;
      if (event.amount > 0 && multiplier > 0) {
        const spellId =
          MERGE_SPELLS.find((x) => x.spellIds.includes(event.ability.guid))?.mergeInto ??
          event.ability.guid;
        if (!spellId) {
          return;
        }
        if (this.buffedSpells[spellId] === undefined) {
          this.buffedSpells[spellId] = 0;
        }

        this.buffedSpells[spellId] += calculateEffectiveDamage(event, multiplier);
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
    if (this.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE_CAST.id)) {
      debug &&
        console.log(
          `Stormstrike reset by Legacy of the Frost Witch at timestamp: ${
            event.timestamp
          } (${this.owner.formatTimestamp(event.timestamp, 3)})`,
        );
      this.spellUsable.endCooldown(SPELLS.STORMSTRIKE_CAST.id, event.timestamp);
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
    const spellList = Object.keys(this.buffedSpells).map(
      (spellId) => this.buffedSpells[Number(spellId)],
    );
    if (spellList?.length > 0) {
      return spellList.reduce((current, total) => (total += current), 0);
    }
    return 0;
  }

  get spellBreakdown() {
    return (
      <>
        {Object.keys(this.buffedSpells).map((spellId) => {
          const spell = maybeGetTalentOrSpell(Number(spellId))!;
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

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} />
          </b>{' '}
          is a significant increase to damage and is important to maintain for as much of the fight
          as possible.
        </p>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} /> uptime
          <div className="flex-main">
            <div style={{ height: '24px' }}>
              {uptimeBarSubStatistic(this.owner.fight, {
                spells: [SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF],
                uptimes: this.getUptimeHistory(SPELLS.LEGACY_OF_THE_FROST_WITCH_BUFF.id),
                color: '#0070DE',
              })}
            </div>
          </div>
        </RoundedPanel>
      </div>
    );

    return (
      <ExplanationAndDataSubSection
        title={
          <>
            <SpellLink spell={TALENTS.LEGACY_OF_THE_FROST_WITCH_TALENT} />
          </>
        }
        explanationPercent={40}
        explanation={explanation}
        data={data}
      />
    );
  }

  getUptimeHistory(spellId: number) {
    const uptimeHistory: Uptime[] = [];
    let current: Uptime;
    this.selectedCombatant.getBuffHistory(spellId).forEach((trackedBuff) => {
      const end = trackedBuff.end ? trackedBuff.end : this.owner.fight.end_time;
      current = { start: trackedBuff.start, end: end };
      uptimeHistory.push(current);
    });

    return uptimeHistory;
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
                <SpellLink spell={SPELLS.STORMSTRIKE_CAST} /> resets
              </li>
              <li>
                <strong>{this.windStrikeResets}</strong>{' '}
                <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> resets
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
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
            <br />
            <small>
              <DamageIcon /> <strong>{formatNumber(this.extraDamage)}</strong> added damage
            </small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LegacyOfTheFrostWitch;
