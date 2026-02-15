import SPELLS_COMMON from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType, HasAbility, HealEvent } from 'parser/core/Events';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import HealingValue, { effectiveHealing } from 'parser/shared/modules/HealingValue';
import { JSX } from 'react';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_MONK } from 'common/TALENTS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import {
  formatDuration,
  formatDurationMinSec,
  formatNumber,
  formatPercentage,
} from 'common/format';
import MAGIC_SCHOOLS, { isMatchingDamageType } from 'game/MAGIC_SCHOOLS';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';

export default class VitalFlames extends Analyzer {
  healingDone: HealingValue = HealingValue.empty();

  healingByAbility: Record<number, HealingValue> = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.VITAL_FLAME_TALENT);

    this.addEventListener(
      Events.heal.to(SELECTED_PLAYER).spell(SPELLS_COMMON.VITAL_FLAME_HEAL),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    this.healingDone = this.healingDone.addEvent(event);

    const sourceEvent = linkHelper.reverse.first(event);

    let source = -1;
    if (sourceEvent) {
      source = sourceEvent.ability.guid;
      const matchingAbilityType =
        isMatchingDamageType(sourceEvent.ability.type, MAGIC_SCHOOLS.ids.FIRE) ||
        isMatchingDamageType(sourceEvent.ability.type, MAGIC_SCHOOLS.ids.NATURE);

      const sourceCount = linkHelper.reverse.get(event).length;
      const healingRatio =
        (effectiveDamage(sourceEvent) + (sourceEvent.overkill ?? 0)) /
        (effectiveHealing(event) + (event.overheal ?? 0));
      const matchingAmount = Math.abs(2 - healingRatio) < 0.1;

      if (!matchingAbilityType || sourceCount > 1 || !matchingAmount) {
        this.addDebugAnnotation(event, {
          color: BadColor,
          summary: `Heal from ${sourceEvent.ability.name}`,
          details: (
            <dl>
              <dt>Source Timestamp</dt>
              <dd>{formatDuration(sourceEvent.timestamp - this.owner.fight.start_time)}</dd>
              <dt>Source Ability Type</dt>
              <dd>
                {sourceEvent.ability.type} (Fire:{' '}
                {isMatchingDamageType(sourceEvent.ability.type, MAGIC_SCHOOLS.ids.FIRE)
                  ? 'True'
                  : 'False'}
                , Nature:{' '}
                {isMatchingDamageType(sourceEvent.ability.type, MAGIC_SCHOOLS.ids.NATURE)
                  ? 'True'
                  : 'False'}
                )
              </dd>
              <dt>Amount (% of Heal)</dt>
              <dd>
                {formatNumber(effectiveDamage(sourceEvent) + (sourceEvent.overkill ?? 0))} (
                {formatPercentage(healingRatio)})
              </dd>
              <dt>Source Count</dt>
              <dd>{sourceCount}</dd>
            </dl>
          ),
        });
      }
    } else {
      this.addDebugAnnotation(event, {
        color: OkColor,
        summary: 'Heal from Unknown Source',
      });
    }
    if (!this.healingByAbility[source]) {
      this.healingByAbility[source] = HealingValue.empty();
    }

    this.healingByAbility[source] = this.healingByAbility[source].addEvent(event);
  }

  private sourceTable(): JSX.Element {
    return (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Damaging Ability</th>
            <th>Healing</th>
            <th>(%)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(this.healingByAbility)
            .toSorted(([, a], [, b]) => b.effective - a.effective)
            .filter(([, value]) => value.effective > 0)
            .map(([spellId, value]) => (
              <tr key={spellId}>
                <td>
                  {spellId === '-1' ? (
                    <em>Unknown</em>
                  ) : (
                    <SpellLink spell={Number.parseInt(spellId)} />
                  )}
                </td>
                <td>{formatNumber(value.effective)}</td>
                <td>{formatPercentage(value.effective / this.healingDone.effective, 1)}%</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  }

  statistic(): JSX.Element {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={this.sourceTable()}
      >
        <TalentSpellText
          talent={
            TALENTS_MONK.VITAL_FLAME_TALENT /* TODO need to add some stuff to wow-dbc to get the remaining talent props */
          }
        >
          <ItemHealingDone amount={this.healingDone.effective} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

const VITAL_FLAME_HEALING_SOURCES = [
  SPELLS.BREATH_OF_FIRE_TALENT,
  SPELLS_COMMON.DRAGONFIRE_BREW_DAMAGE,
  //SPELLS_COMMON.FLURRY_STRIKES_DAMAGE_MIDNIGHT,
  SPELLS_COMMON.BREATH_OF_FIRE_DEBUFF,
  SPELLS_COMMON.CHI_BURST_TALENT_DAMAGE,
  SPELLS_COMMON.CHI_WAVE_TALENT_DAMAGE,
  SPELLS.EXPLODING_KEG_TALENT,
  SPELLS_COMMON.EXPLODING_KEG_DEBUFF_DAMAGE,
  SPELLS_COMMON.EXPEL_HARM_DAMAGE,
  SPELLS.CRACKLING_JADE_LIGHTNING,
  // TODO: handle Celestial Flames altering the damage types of SD/RJW
];

const { normalizer, linkHelper } = EventLinkNormalizer.build({
  linkRelation: 'vital-flame-source',
  reverseLinkRelation: 'vital-flame-heal',
  linkingEventId: VITAL_FLAME_HEALING_SOURCES.map((spell) => spell.id),
  linkingEventType: EventType.Damage,
  maximumLinks: 1,
  forwardBufferMs: 200,
  referencedEventId: SPELLS_COMMON.VITAL_FLAME_HEAL.id,
  referencedEventType: EventType.Heal,
  anyTarget: true,
  // do not link the same heal event to multiple damage events
  additionalCondition: (event, referencedEvent): boolean =>
    linkHelper.reverse.first(referencedEvent) === undefined &&
    HasAbility(event) &&
    (isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.FIRE) ||
      isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.NATURE)),
});

export const VitalFlameNormalizer = normalizer;
