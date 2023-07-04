import AtonementDamageSource from 'analysis/retail/priest/discipline/modules/features/AtonementDamageSource';
import { formatNumber, formatPercentage } from 'common/format';
import SPECS from 'game/SPECS';
import { SpellIcon, TooltipElement } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Abilities from 'parser/core/modules/Abilities';

// const DAMAGING_SPELL_IDS = [
//   SPELLS.ASCENDED_BLAST.id,
//   SPELLS.ASCENDED_NOVA.id,
//   SPELLS.ASCENDED_ERUPTION.id,
// ];

// const HEALING_SPELL_ID_MAP = {
//   [SPELLS.ASCENDED_BLAST_HEAL.id]: SPELLS.ASCENDED_BLAST.id,
//   [SPELLS.ASCENDED_NOVA_HEAL.id]: SPELLS.ASCENDED_NOVA.id,
//   [SPELLS.ASCENDED_ERUPTION_HEAL.id]: SPELLS.ASCENDED_ERUPTION.id,
// };

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
    // [SPELLS.ASCENDED_BLAST.id]: {
    //   casts: 0,
    //   friendlyHits: 0,
    //   enemyHits: 0,
    //   healingDone: 0,
    //   overHealingDone: 0,
    //   atonmentHealingDone: 0,
    //   atonementOverHealingDone: 0,
    //   damageDone: 0,
    // },
    // [SPELLS.ASCENDED_NOVA.id]: {
    //   casts: 0,
    //   friendlyHits: 0,
    //   enemyHits: 0,
    //   healingDone: 0,
    //   overHealingDone: 0,
    //   atonmentHealingDone: 0,
    //   atonementOverHealingDone: 0,
    //   damageDone: 0,
    // },
    // [SPELLS.ASCENDED_ERUPTION.id]: {
    //   casts: 0,
    //   friendlyHits: 0,
    //   enemyHits: 0,
    //   healingDone: 0,
    //   overHealingDone: 0,
    //   atonmentHealingDone: 0,
    //   atonementOverHealingDone: 0,
    //   damageDone: 0,
    // },
  };

  get totalDamage() {
    return Object.values(this.ascendedSpellTracker).reduce((a, b) => a + b.damageDone, 0);
  }

  get totalDirectHealing() {
    return Object.values(this.ascendedSpellTracker).reduce((a, b) => a + b.healingDone, 0);
  }

  get totalDirectOverHealing() {
    return Object.values(this.ascendedSpellTracker).reduce((a, b) => a + b.overHealingDone, 0);
  }

  get totalAtonementHealing() {
    return Object.values(this.ascendedSpellTracker).reduce((a, b) => a + b.atonmentHealingDone, 0);
  }

  get totalAtonementOverHealing() {
    return Object.values(this.ascendedSpellTracker).reduce(
      (a, b) => a + b.atonementOverHealingDone,
      0,
    );
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

    this.active = false;
    if (!this.active) {
      return;
    }

    // const castEfficiency =
    //   this.selectedCombatant.spec === SPECS.SHADOW_PRIEST
    //     ? {
    //         suggestion: true,
    //         recommendedEfficiency: 0.9,
    //         averageIssueEfficiency: 0.8,
    //         majorIssueEfficiency: 0.7,
    //       }
    //     : {
    //         suggestion: true,
    //         recommendedEfficiency: 0.8,
    //         averageIssueEfficiency: 0.6,
    //         majorIssueEfficiency: 0.4,
    //       };
    // (options.abilities as Abilities).add({
    //   spell: SPELLS.BOON_OF_THE_ASCENDED.id,
    //   category: SPELL_CATEGORY.ROTATIONAL,
    //   cooldown: 180,
    //   enabled: true,
    //   gcd: {
    //     base: 1500,
    //   },
    //   castEfficiency: castEfficiency,
    // });
    // (options.abilities as Abilities).add({
    //   spell: SPELLS.ASCENDED_BLAST.id,
    //   category: SPELL_CATEGORY.ROTATIONAL,
    //   enabled: true,
    //   gcd: {
    //     base: 1000,
    //   },
    // });
    // (options.abilities as Abilities).add({
    //   spell: SPELLS.ASCENDED_NOVA.id,
    //   category: SPELL_CATEGORY.ROTATIONAL,
    //   enabled: true,
    //   gcd: {
    //     base: 1000,
    //   },
    // });
    // (options.abilities as Abilities).add({
    //   spell: SPELLS.ASCENDED_ERUPTION.id,
    //   category: SPELL_CATEGORY.ROTATIONAL,
    //   enabled: true,
    //   gcd: {
    //     base: 0,
    //   },
    // });

    // if (this.isDisc) {
    //   this.atonementDamageSource = this.owner.getModule(AtonementDamageSource);
    //   this.addEventListener(
    //     Events.heal
    //       .by(SELECTED_PLAYER)
    //       .spell([SPELLS.ATONEMENT_HEAL_NON_CRIT, SPELLS.ATONEMENT_HEAL_CRIT]),
    //     this.onAtonmentHeal,
    //   );
    // }

    // this.addEventListener(
    //   Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BOON_OF_THE_ASCENDED),
    //   this.onCast,
    // );
    // this.addEventListener(
    //   Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BOON_OF_THE_ASCENDED),
    //   this.onBuffRemove,
    // );
    // this.addEventListener(
    //   Events.damage
    //     .by(SELECTED_PLAYER)
    //     .spell([SPELLS.ASCENDED_BLAST, SPELLS.ASCENDED_NOVA, SPELLS.ASCENDED_ERUPTION]),
    //   this.onDamage,
    // );
    // this.addEventListener(
    //   Events.heal
    //     .by(SELECTED_PLAYER)
    //     .spell([
    //       SPELLS.ASCENDED_BLAST_HEAL,
    //       SPELLS.ASCENDED_NOVA_HEAL,
    //       SPELLS.ASCENDED_ERUPTION_HEAL,
    //     ]),
    //   this.onNormalHeal,
    // );
  }

  onCast() {
    this.castCount += 1;
  }

  onDamage(event: DamageEvent) {
    this.ascendedSpellTracker[event.ability.guid].damageDone +=
      event.amount + (event.absorbed || 0);
    this.ascendedSpellTracker[event.ability.guid].enemyHits += 1;
  }

  // onAtonmentHeal(event: HealEvent) {
  //   if (!this.atonementDamageSource) {
  //     return;
  //   }
  //   const atonenementDamageEvent = this.atonementDamageSource.event;
  //   if (
  //     !atonenementDamageEvent ||
  //     !DAMAGING_SPELL_IDS.includes(atonenementDamageEvent.ability.guid)
  //   ) {
  //     return;
  //   }
  //
  //   this.ascendedSpellTracker[atonenementDamageEvent.ability.guid].atonmentHealingDone +=
  //     event.amount;
  //   // TODO: Fix Spirit Shell
  //   if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_SHELL_TALENT_BUFF.id)) {
  //     this.ascendedSpellTracker[atonenementDamageEvent.ability.guid].atonmentHealingDone +=
  //       event.absorb || 0;
  //   }
  //
  //   this.ascendedSpellTracker[atonenementDamageEvent.ability.guid].atonementOverHealingDone +=
  //     event.overheal || 0;
  // }

  // onNormalHeal(event: HealEvent) {
  //   this.ascendedSpellTracker[HEALING_SPELL_ID_MAP[event.ability.guid]].healingDone += event.amount;
  //   // TODO: Fix Spirit Shell
  //   if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_SHELL_TALENT_BUFF.id)) {
  //     this.ascendedSpellTracker[HEALING_SPELL_ID_MAP[event.ability.guid]].healingDone +=
  //       event.absorb || 0;
  //   }
  //
  //   this.ascendedSpellTracker[HEALING_SPELL_ID_MAP[event.ability.guid]].overHealingDone +=
  //     event.overheal || 0;
  //   this.ascendedSpellTracker[HEALING_SPELL_ID_MAP[event.ability.guid]].friendlyHits += 1;
  // }

  onBuffRemove() {
    // This has an accurate buff count until after this event resolves.
    // this.stackTracker.push(this.selectedCombatant.getBuffStacks(SPELLS.BOON_OF_THE_ASCENDED.id));
  }

  getOverhealingPercent(totalHealing: number, totalOverHealing: number) {
    return formatPercentage(totalOverHealing / (totalHealing + totalOverHealing));
  }

  spellTable() {
    return Object.entries(this.ascendedSpellTracker).map(([spellId, data]) => (
      <tr key={'bota_' + spellId}>
        <td>
          <SpellIcon spell={Number(spellId)} style={{ height: '2.4em' }} />
        </td>
        <td>
          <TooltipElement
            content={`${this.getOverhealingPercent(
              data.healingDone,
              data.overHealingDone,
            )}% Overhealing`}
          >
            {formatNumber(data.healingDone)}
          </TooltipElement>
        </td>
        {this.isDisc && (
          <td>
            <TooltipElement
              content={`${this.getOverhealingPercent(
                data.atonmentHealingDone,
                data.atonementOverHealingDone,
              )}% Overhealing`}
            >
              {formatNumber(data.atonmentHealingDone)}
            </TooltipElement>
          </td>
        )}
        <td>{formatNumber(data.damageDone)}</td>
        <td>
          <span style={{ color: 'green' }}>{data.friendlyHits}</span> |
          <span style={{ color: 'red' }}> {data.enemyHits}</span>
        </td>
      </tr>
    ));
  }

  // statistic() {
  //   return (
  //     <Statistic
  //       wide={this.isDisc}
  //       size="flexible"
  //       tooltip={
  //         <>
  //           Total Casts: {this.castCount}
  //           <br />
  //           Average Boon Stacks: {this.averageStacks}
  //         </>
  //       }
  //       dropdown={
  //         <table className={this.isDisc ? 'table' : 'table table-condensed'}>
  //           <thead>
  //             <tr>
  //               <th>Spell</th>
  //               <th>Healing</th>
  //               {this.isDisc && <th>Atonement Healing</th>}
  //               <th>Damage</th>
  //
  //               <th>
  //                 <TooltipElement
  //                   content={
  //                     <>
  //                       <span style={{ color: 'green' }}>Friendly</span> |{' '}
  //                       <span style={{ color: 'red' }}>Enemy</span>
  //                     </>
  //                   }
  //                 >
  //                   Targets Hit
  //                 </TooltipElement>
  //               </th>
  //             </tr>
  //           </thead>
  //           <tbody>{this.spellTable()}</tbody>
  //         </table>
  //       }
  //       category={STATISTIC_CATEGORY.COVENANTS}
  //     >
  //       <BoringSpellValueText spellId={SPELLS.BOON_OF_THE_ASCENDED.id}>
  //         <ItemHealingDone amount={this.totalAtonementHealing + this.totalDirectHealing} />
  //         <br />
  //         <ItemDamageDone amount={this.totalDamage} />
  //       </BoringSpellValueText>
  //     </Statistic>
  //   );
  // }
}

export default BoonOfTheAscended;
