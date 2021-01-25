import React from 'react';

import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import AtonementDamageSource from '@wowanalyzer/priest-discipline/src/modules/features/AtonementDamageSource';
import SPECS from 'game/SPECS';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { SpellIcon } from 'interface';
import { TooltipElement } from 'interface';
import Abilities from 'parser/core/modules/Abilities';

const DAMAGING_SPELL_IDS = [
  SPELLS.ASCENDED_BLAST.id,
  SPELLS.ASCENDED_NOVA.id,
  SPELLS.ASCENDED_ERUPTION.id,
];

const HEALING_SPELL_ID_MAP = {
  [SPELLS.ASCENDED_BLAST_HEAL.id]: SPELLS.ASCENDED_BLAST.id,
  [SPELLS.ASCENDED_NOVA_HEAL.id]: SPELLS.ASCENDED_NOVA.id,
  [SPELLS.ASCENDED_ERUPTION_HEAL.id]: SPELLS.ASCENDED_ERUPTION.id,
};

interface AscendedSpellTracker {
  casts: number;
  friendlyHits: number;
  enemyHits: number;
  healingDone: number;
  overHealingDone: number;
  atonmentHealingDone: number;
  atonementOverHealingDone: number;
  damageDone: number;
}

// Shadow: https://www.warcraftlogs.com/reports/CdrMAqzkLaKZTVn4#fight=1&type=damage-done&graphperf=1&source=19
// Holy: https://www.warcraftlogs.com/reports/xf7zjvNghdXVRrFT#fight=7&type=healing&graphperf=1&source=18
// Disc: https://www.warcraftlogs.com/reports/FwfkDG87xzV9CWra#fight=17&type=healing&source=14
class BoonOfTheAscended extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  protected abilities!: Abilities;

  castCount = 0;
  stackTracker: number[] = [];

  // Disc Specific
  atonementDamageSource: AtonementDamageSource | null = null;

  ascendedSpellTracker: { [spellId: number]: AscendedSpellTracker } = {
    [SPELLS.ASCENDED_BLAST.id]: {
      casts: 0,
      friendlyHits: 0,
      enemyHits: 0,
      healingDone: 0,
      overHealingDone: 0,
      atonmentHealingDone: 0,
      atonementOverHealingDone: 0,
      damageDone: 0,
    },
    [SPELLS.ASCENDED_NOVA.id]: {
      casts: 0,
      friendlyHits: 0,
      enemyHits: 0,
      healingDone: 0,
      overHealingDone: 0,
      atonmentHealingDone: 0,
      atonementOverHealingDone: 0,
      damageDone: 0,
    },
    [SPELLS.ASCENDED_ERUPTION.id]: {
      casts: 0,
      friendlyHits: 0,
      enemyHits: 0,
      healingDone: 0,
      overHealingDone: 0,
      atonmentHealingDone: 0,
      atonementOverHealingDone: 0,
      damageDone: 0,
    },
  };

  get totalDamage() {
    let total = 0;
    for (const spellId in this.ascendedSpellTracker) {
      total += this.ascendedSpellTracker[spellId].damageDone;
    }
    return total;
  }

  get totalDirectHealing() {
    let total = 0;
    for (const spellId in this.ascendedSpellTracker) {
      total += this.ascendedSpellTracker[spellId].healingDone;
    }
    return total;
  }

  get totalDirectOverHealing() {
    let total = 0;
    for (const spellId in this.ascendedSpellTracker) {
      total += this.ascendedSpellTracker[spellId].overHealingDone;
    }
    return total;
  }

  get totalAtonementHealing() {
    let total = 0;
    for (const spellId in this.ascendedSpellTracker) {
      total += this.ascendedSpellTracker[spellId].atonmentHealingDone;
    }
    return total;
  }

  get totalAtonementOverHealing() {
    let total = 0;
    for (const spellId in this.ascendedSpellTracker) {
      total += this.ascendedSpellTracker[spellId].atonementOverHealingDone;
    }
    return total;
  }

  get averageStacks() {
    if (this.stackTracker.length === 0) {
      return 0;
    }

    return this.stackTracker.reduce((a, b) => a + b, 0) / this.stackTracker.length;
  }

  get isDisc() {
    return this.selectedCombatant.spec === SPECS.DISCIPLINE_PRIEST;
  }

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);
    if (!this.active) {
      return;
    }

    const castEfficiency = this.selectedCombatant.spec === SPECS.SHADOW_PRIEST ? {
      suggestion: true,
      recommendedEfficiency: 0.9,
      averageIssueEfficiency: 0.8,
      majorIssueEfficiency: 0.7,
    } : {
      suggestion: true,
      recommendedEfficiency: 0.8,
      averageIssueEfficiency: 0.6,
      majorIssueEfficiency: 0.4,
    };
    (options.abilities as Abilities).add({
      spell: SPELLS.BOON_OF_THE_ASCENDED,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      cooldown: 180,
      enabled: true,
      gcd: {
        base: 1500,
      },
      castEfficiency: castEfficiency,
    });
    (options.abilities as Abilities).add({
      spell: SPELLS.ASCENDED_BLAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      enabled: true,
      gcd: {
        base: 1000,
      },
    });
    (options.abilities as Abilities).add({
      spell: SPELLS.ASCENDED_NOVA,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      enabled: true,
      gcd: {
        base: 1000,
      },
    });
    (options.abilities as Abilities).add({
      spell: SPELLS.ASCENDED_ERUPTION,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      enabled: true,
      gcd: {
        base: 0,
      },
    });

    if (this.isDisc) {
      this.atonementDamageSource = this.owner.getModule(AtonementDamageSource);
      this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ATONEMENT_HEAL_NON_CRIT, SPELLS.ATONEMENT_HEAL_CRIT]), this.onAtonmentHeal);
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BOON_OF_THE_ASCENDED), this.onCast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BOON_OF_THE_ASCENDED), this.onBuffRemove);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.ASCENDED_BLAST, SPELLS.ASCENDED_NOVA, SPELLS.ASCENDED_ERUPTION]), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ASCENDED_BLAST_HEAL, SPELLS.ASCENDED_NOVA_HEAL, SPELLS.ASCENDED_ERUPTION_HEAL]), this.onNormalHeal);
  }

  onCast() {
    this.castCount += 1;
  }

  onDamage(event: DamageEvent) {
    this.ascendedSpellTracker[event.ability.guid].damageDone += event.amount + (event.absorbed || 0);
    this.ascendedSpellTracker[event.ability.guid].enemyHits += 1;
  }

  onAtonmentHeal(event: HealEvent) {
    if (!this.atonementDamageSource) {
      return;
    }
    const atonenementDamageEvent = this.atonementDamageSource.event;
    if (!atonenementDamageEvent || !DAMAGING_SPELL_IDS.includes(atonenementDamageEvent.ability.guid)) {
      return;
    }

    this.ascendedSpellTracker[atonenementDamageEvent.ability.guid].atonmentHealingDone += event.amount;
    // TODO: Fix Spirit Shell
    if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_SHELL_TALENT_BUFF.id)) {
      this.ascendedSpellTracker[atonenementDamageEvent.ability.guid].atonmentHealingDone += event.absorb || 0;
    }

    this.ascendedSpellTracker[atonenementDamageEvent.ability.guid].atonementOverHealingDone += (event.overheal || 0);
  }

  onNormalHeal(event: HealEvent) {
    this.ascendedSpellTracker[HEALING_SPELL_ID_MAP[event.ability.guid]].healingDone += event.amount;
    // TODO: Fix Spirit Shell
    if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_SHELL_TALENT_BUFF.id)) {
      this.ascendedSpellTracker[HEALING_SPELL_ID_MAP[event.ability.guid]].healingDone += event.absorb || 0;
    }

    this.ascendedSpellTracker[HEALING_SPELL_ID_MAP[event.ability.guid]].overHealingDone += (event.overheal || 0);
    this.ascendedSpellTracker[HEALING_SPELL_ID_MAP[event.ability.guid]].friendlyHits += 1;
  }

  onBuffRemove() {
    // This has an accurate buff count until after this event resolves.
    this.stackTracker.push(this.selectedCombatant.getBuffStacks(SPELLS.BOON_OF_THE_ASCENDED.id));
  }

  getOverhealingPercent(totalHealing: number, totalOverHealing: number) {
    return formatPercentage(totalOverHealing / (totalHealing + totalOverHealing));
  }

  spellTable() {
    const rows = [];

    for (const spellId in this.ascendedSpellTracker) {
      rows.push(
        <tr key={'bota_' + spellId}>
          <td><SpellIcon id={Number(spellId)} style={{ height: '2.4em' }} /></td>
          <td>
            <TooltipElement content={`${this.getOverhealingPercent(this.ascendedSpellTracker[spellId].healingDone, this.ascendedSpellTracker[spellId].overHealingDone)}% Overhealing`}>
              {formatNumber(this.ascendedSpellTracker[spellId].healingDone)}
            </TooltipElement>
          </td>
          {this.isDisc && <td>
            <TooltipElement content={`${this.getOverhealingPercent(this.ascendedSpellTracker[spellId].atonmentHealingDone, this.ascendedSpellTracker[spellId].atonementOverHealingDone)}% Overhealing`}>
              {formatNumber(this.ascendedSpellTracker[spellId].atonmentHealingDone)}
            </TooltipElement>
          </td>}
          <td>{formatNumber(this.ascendedSpellTracker[spellId].damageDone)}</td>
          <td>
            <span style={{ color: 'green' }}>{this.ascendedSpellTracker[spellId].friendlyHits}</span> |
            <span style={{ color: 'red' }}> {this.ascendedSpellTracker[spellId].enemyHits}</span>
          </td>
        </tr>,
      );
    }

    return rows;
  }

  statistic() {
    return (
      <Statistic
        wide={this.isDisc}
        size="flexible"
        tooltip={
          <>
            Total Casts: {this.castCount}<br />
            Average Boon Stacks: {this.averageStacks}
          </>
        }
        dropdown={(
          <table className={this.isDisc ? 'table' : 'table table-condensed'}>
            <thead>
              <tr>
                <th>Spell</th>
                <th>Healing</th>
                {this.isDisc && <th>Atonement Healing</th>}
                <th>Damage</th>

                <th>
                  <TooltipElement content={(<><span style={{ color: 'green' }}>Friendly</span> | <span style={{ color: 'red' }}>Enemy</span></>)}>
                    Targets Hit
                  </TooltipElement>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.spellTable()}
            </tbody>
          </table>
        )}
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.BOON_OF_THE_ASCENDED}>
          <ItemHealingDone amount={this.totalAtonementHealing + this.totalDirectHealing} /><br />
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BoonOfTheAscended;
