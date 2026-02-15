import { TALENTS_MONK } from 'common/TALENTS/monk';
import SPELLS from 'common/SPELLS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { PEACEFUL_MENDING_INCREASE } from '../../constants';
import Combatants from 'parser/shared/modules/Combatants';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import type Spell from 'common/SPELLS/Spell';

const SOOTHING_MIST_SOURCES = [
  { spell: TALENTS_MONK.SOOTHING_MIST_TALENT, buffId: TALENTS_MONK.SOOTHING_MIST_TALENT.id },
  { spell: TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT, buffId: SPELLS.SOOTHING_MIST_STATUE.id },
  // removed once mistline is fixed to no longer proc unison
  { spell: SPELLS.UNISON_HEAL, buffId: SPELLS.UNISON_HEAL.id },
  { spell: TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT, buffId: SPELLS.SPIRITFONT_HOT.id },
] as const;

class PeacefulMending extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healingBySource = new Map<Spell, number>();

  renewingMistHealing = 0;
  envelopingMistHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.PEACEFUL_MENDING_TALENT);

    SOOTHING_MIST_SOURCES.forEach(({ spell }) => {
      this.healingBySource.set(spell, 0);
    });

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRenewingMistHeal,
    );

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([TALENTS_MONK.ENVELOPING_MIST_TALENT, SPELLS.ENVELOPING_MIST_TFT]),
      this.onEnvelopingMistHeal,
    );
  }

  onRenewingMistHeal(event: HealEvent) {
    const healing = this.handleHealEvent(event);
    this.renewingMistHealing += healing;
  }

  onEnvelopingMistHeal(event: HealEvent) {
    const healing = this.handleHealEvent(event);
    this.envelopingMistHealing += healing;
  }

  handleHealEvent(event: HealEvent): number {
    const target = event.targetID ? this.combatants.getEntity(event) : null;

    const activeSource = target
      ? SOOTHING_MIST_SOURCES.find((source) => target.hasBuff(source.buffId))
      : null;

    if (!activeSource) {
      return 0;
    }

    const effectiveHealing = calculateEffectiveHealing(event, PEACEFUL_MENDING_INCREASE);
    this.healingBySource.set(
      activeSource.spell,
      (this.healingBySource.get(activeSource.spell) || 0) + effectiveHealing,
    );

    return effectiveHealing;
  }

  get totalHealing() {
    return Array.from(this.healingBySource.values()).reduce((total, healing) => total + healing, 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.PEACEFUL_MENDING_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>Effective healing:</strong>
            <ul>
              <li>
                <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} />:{' '}
                {formatNumber(this.renewingMistHealing)} (
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(this.renewingMistHealing),
                )}
                %)
              </li>
              <li>
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />:{' '}
                {formatNumber(this.envelopingMistHealing)} (
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(this.envelopingMistHealing),
                )}
                %)
              </li>
            </ul>
            <strong>Contribution by source:</strong>
            <ul>
              {SOOTHING_MIST_SOURCES.map(({ spell }) => {
                const healing = this.healingBySource.get(spell) || 0;
                if (healing === 0) {
                  return null;
                }
                return (
                  <li key={spell.id}>
                    <SpellLink spell={spell} />: {formatNumber(healing)} (
                    {formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))}
                    %)
                  </li>
                );
              })}
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.PEACEFUL_MENDING_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PeacefulMending;
