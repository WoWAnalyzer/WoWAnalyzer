import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import {
  ATONEMENT_DAMAGE_SOURCES,
  ATONEMENT_HEAL_IDS,
} from 'analysis/classic/priest/discipline/constants';
import SPELLS from 'common/SPELLS/classic/priest';
import Statistic from 'parser/ui/Statistic';
import DonutChart from 'parser/ui/DonutChart';
import { maybeGetSpell } from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

interface AtonementHealingEvent {
  damageEvent: DamageEvent;
  healEvent: HealEvent;
}

interface ScovSourceGraphItem {
  color: string;
  spellId: number;
  label: string;
  value: number;
  valueTooltip?: string | number;
}

const COLORS = {
  [SPELLS.PENANCE_DAMAGE.id]: '#FF8B13',
  [SPELLS.SMITE.id]: '#3D1766',
  [SPELLS.HOLY_FIRE.id]: '#3C79F5',
};

export default class AtonementAnalyzer extends Analyzer {
  protected eventEmitter!: EventEmitter;
  protected atonementHealingEvents!: AtonementHealingEvent[];
  protected lastAtonementDamageApplication!: DamageEvent;

  static dependencies = {
    eventEmitter: EventEmitter,
  };

  get healingData() {
    const healingByDamagingSpellId = {
      [SPELLS.PENANCE_DAMAGE.id]: {
        healingDone: 0,
        overhealingDone: 0,
        damageDone: 0,
      },
      [SPELLS.SMITE.id]: {
        healingDone: 0,
        overhealingDone: 0,
        damageDone: 0,
      },
      [SPELLS.HOLY_FIRE.id]: {
        healingDone: 0,
        overhealingDone: 0,
        damageDone: 0,
      },
    };

    this.atonementHealingEvents.forEach((atonementHealingEvent: AtonementHealingEvent) => {
      const damageEventAbilityId = atonementHealingEvent.damageEvent.ability.guid;
      healingByDamagingSpellId[damageEventAbilityId].healingDone +=
        atonementHealingEvent.healEvent.amount;
      healingByDamagingSpellId[damageEventAbilityId].overhealingDone +=
        atonementHealingEvent.healEvent.overheal || 0;
      healingByDamagingSpellId[damageEventAbilityId].damageDone +=
        atonementHealingEvent.damageEvent.amount;
    });

    return healingByDamagingSpellId;
  }

  get doughnutData(): ScovSourceGraphItem[] {
    const healingByDamagingSpellId = this.healingData;

    return ATONEMENT_DAMAGE_SOURCES.map((spellId) => {
      const healingDone = formatNumber(healingByDamagingSpellId[spellId].healingDone);
      const overhealPercent = formatPercentage(
        healingByDamagingSpellId[spellId].overhealingDone /
          (healingByDamagingSpellId[spellId].overhealingDone +
            healingByDamagingSpellId[spellId].healingDone),
      );

      return {
        color: `${COLORS[spellId]}`,
        spellId: spellId,
        label: maybeGetSpell(spellId)?.name || '',
        value: healingByDamagingSpellId[spellId].healingDone,
        valueTooltip: `${healingDone} (${overhealPercent}% overhealing)`,
      };
    }).sort((a, b) => {
      return a.value < b.value ? 1 : -1;
    });
  }

  get effectiveHealing(): number {
    return this.atonementHealingEvents.reduce((prev, curr, index, array) => {
      return prev + curr.healEvent.amount;
    }, 0);
  }

  get overHealing(): number {
    return this.atonementHealingEvents.reduce((prev, curr, index, array) => {
      return prev + (curr.healEvent.overheal || 0);
    }, 0);
  }

  get totalHealing(): number {
    return this.effectiveHealing + this.overHealing;
  }

  get totalDamage(): number {
    return this.atonementHealingEvents.reduce((prev, curr, index, array) => {
      return prev + curr.damageEvent.amount;
    }, 0);
  }

  constructor(options: Options) {
    super(options);

    this.atonementHealingEvents = [];
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._processAtonement);
    this.addEventListener(Events.damage, this._processAtonementDamageSource);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.GENERAL}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ATONEMENT_HEAL_NON_CRIT}>
          <ItemHealingDone amount={this.effectiveHealing} />
          <br />
          {formatNumber(this.overHealing)}{' '}
          <small>
            Overhealing ({`${formatPercentage(this.overHealing / this.effectiveHealing)}%`})
          </small>
          <br />
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
        <div style={{ padding: 8 }}>
          <DonutChart items={this.doughnutData.filter((item) => item.value !== 0)} />
        </div>
      </Statistic>
    );
  }

  private _processAtonementDamageSource(event: DamageEvent) {
    if (!ATONEMENT_DAMAGE_SOURCES.includes(event.ability.guid)) {
      return;
    }
    this.lastAtonementDamageApplication = event;
  }

  private _processAtonement(event: HealEvent) {
    if (!ATONEMENT_HEAL_IDS.includes(event.ability.guid)) {
      return;
    }
    if (this.lastAtonementDamageApplication) {
      this.atonementHealingEvents.push({
        damageEvent: this.lastAtonementDamageApplication,
        healEvent: event,
      });
    }
  }
}
