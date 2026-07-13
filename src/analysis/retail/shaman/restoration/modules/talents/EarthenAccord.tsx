import { Trans } from '@lingui/react/macro';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import DonutChart from 'parser/ui/DonutChart';
import UnleashLife from './UnleashLife';
import { RESTORATION_COLORS, UNLEASH_LIFE_REMOVE_MS, healingIncreases } from '../../constants';
import {
  isBuffedByUnleashLife,
  getUnleashLifeHealingWaves,
} from '../../normalizers/UnleashLifeNormalizer';
import ChainHealNormalizer from '../../normalizers/ChainHealNormalizer';
import RiptideTracker from '../core/RiptideTracker';

class EarthenAccordAnalyzer extends Analyzer {
  static dependencies = {
    unleashLife: UnleashLife,
    chainHealNormalizer: ChainHealNormalizer,
    riptideTracker: RiptideTracker,
  };

  protected unleashLife!: UnleashLife;
  protected chainHealNormalizer!: ChainHealNormalizer;
  protected riptideTracker!: RiptideTracker;

  buffedUnleashLifeIncrease =
    healingIncreases.UNLEASH_LIFE_HEALING_INCREASE * 1 +
    healingIncreases.EARTHEN_ACCORD_BUFF_INCREASE;
  earthenAccordBuffContribution =
    healingIncreases.EARTHEN_ACCORD_BUFF_INCREASE / this.buffedUnleashLifeIncrease;
  healing = 0;
  healingBySource = new Map<number, number>();
  ulActive = false;
  lastRemoved = -1;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EARTHEN_ACCORD_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this.onUnleashLifeHeal,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.CHAIN_HEAL_TALENT, SPELLS.HEALING_WAVE]),
      this.onHealCast,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.onRiptide,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this.onApplyUnleashLife,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.UNLEASH_LIFE_TALENT),
      this.onRemoveUnleashLife,
    );
  }

  onApplyUnleashLife() {
    this.ulActive = true;
  }

  onRemoveUnleashLife(event: RemoveBuffEvent) {
    this.lastRemoved = event.timestamp; //Since we track Riptide a directly now we don't need to force a ULa=false anymore as long as we check in AlreadyConsumed.
  }

  unleashAlreadyConsumed(event: CastEvent | HealEvent) {
    if (this.lastRemoved + UNLEASH_LIFE_REMOVE_MS < event.timestamp || this.ulActive) {
      this.ulActive = false;
      return false;
    }
    return true;
  }

  mapSpellHealing(spellId: number, amount: number) {
    this.healing += amount;
    const prev = this.healingBySource.get(spellId) || 0;
    this.healingBySource.set(spellId, prev + amount);
  }

  onUnleashLifeHeal(event: HealEvent) {
    const total = event.amount + (event.absorbed || 0);
    this.mapSpellHealing(
      TALENTS.UNLEASH_LIFE_TALENT.id,
      total * (1 - 1 / (1 + healingIncreases.EARTHEN_ACCORD_UL_DIRECT_INCREASE)),
    );
  }

  onHealCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (isBuffedByUnleashLife(event) && !this.unleashAlreadyConsumed(event)) {
      switch (spellId) {
        case SPELLS.HEALING_WAVE.id: {
          const waves = getUnleashLifeHealingWaves(event);
          const amount = waves.reduce(
            (sum, e) =>
              sum +
              calculateEffectiveHealing(e, this.buffedUnleashLifeIncrease) *
                this.earthenAccordBuffContribution,
            0,
          );
          this.mapSpellHealing(spellId, amount);
          break;
        }
        case TALENTS.CHAIN_HEAL_TALENT.id: {
          const chain = this.chainHealNormalizer.normalizeChainHealOrder(event);
          const amount = chain.reduce(
            (sum, e) =>
              sum +
              calculateEffectiveHealing(e, this.buffedUnleashLifeIncrease) *
                this.earthenAccordBuffContribution,
            0,
          );
          this.mapSpellHealing(spellId, amount);
          break;
        }
      }
    }
  }

  onRiptide(event: HealEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (event.tick) {
      if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
        return;
      }
      const riptide = this.riptideTracker.hots[targetId][spellId];
      if (this.riptideTracker.fromUnleashLife(riptide)) {
        this.mapSpellHealing(
          spellId,
          calculateEffectiveHealing(event, this.buffedUnleashLifeIncrease) *
            this.earthenAccordBuffContribution,
        );
      }
      return;
    }

    if (isBuffedByUnleashLife(event) && !this.unleashAlreadyConsumed(event)) {
      this.mapSpellHealing(
        spellId,
        calculateEffectiveHealing(event, this.buffedUnleashLifeIncrease) *
          this.earthenAccordBuffContribution,
      );
    }
  }

  get earthenAccordCastRatioChart() {
    const getAmount = (id: number) => this.healingBySource.get(id) || 0;

    const items = [
      {
        color: RESTORATION_COLORS.UNLEASH_LIFE,
        label: <Trans id="shaman.restoration.spell.unleashLifeDirect">Unleash Life (Direct)</Trans>,
        spellId: TALENTS.UNLEASH_LIFE_TALENT.id,
        value: getAmount(TALENTS.UNLEASH_LIFE_TALENT.id),
        valueTooltip: <ItemHealingDone amount={getAmount(TALENTS.UNLEASH_LIFE_TALENT.id)} />,
      },
      {
        color: RESTORATION_COLORS.RIPTIDE,
        label: <Trans id="shaman.restoration.spell.riptide">Riptide</Trans>,
        spellId: TALENTS.RIPTIDE_TALENT.id,
        value: getAmount(TALENTS.RIPTIDE_TALENT.id),
        valueTooltip: <ItemHealingDone amount={getAmount(TALENTS.RIPTIDE_TALENT.id)} />,
      },
      {
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: TALENTS.CHAIN_HEAL_TALENT.id,
        value: getAmount(TALENTS.CHAIN_HEAL_TALENT.id),
        valueTooltip: <ItemHealingDone amount={getAmount(TALENTS.CHAIN_HEAL_TALENT.id)} />,
      },
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: SPELLS.HEALING_WAVE.id,
        value: getAmount(SPELLS.HEALING_WAVE.id),
        valueTooltip: <ItemHealingDone amount={getAmount(SPELLS.HEALING_WAVE.id)} />,
      },
    ]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.EARTHEN_ACCORD_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
        <aside className="pad">
          <hr />
          <header>
            <label>Earthen Accord Healing Sources</label>
          </header>
          {this.earthenAccordCastRatioChart}
        </aside>
      </Statistic>
    );
  }
}

export default EarthenAccordAnalyzer;
