import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Soup from 'interface/icons/Soup';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import {
  IMMINENT_DESTRUCTION_ESSENCE_REDUCTION,
  IMMINENT_DESTRUCTION_MULTIPLIER,
} from '../../constants';
import SPECS from 'game/SPECS';
import { isCastFromEB } from '../normalizers/EssenceBurstCastLinkNormalizer';

/**
 * Deep Breath/Breath of Eons reduces the Essence costs of Disintegrate, Pyre and Eruption by 1
 * and increases their damage by 10% for 12 sec after you land.
 */
class ImminentDestruction extends Analyzer {
  disintegrateDamage = 0;
  pyreDamage = 0;
  eruptionDamage = 0;

  disintegrateEssenceReduction = 0;
  pyreEssenceReduction = 0;
  eruptionEssenceReduction = 0;

  imminentDestructionBuffId = 0;
  isDeva = this.selectedCombatant.spec === SPECS.DEVASTATION_EVOKER;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.IMMINENT_DESTRUCTION_DEVASTATION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT);

    this.imminentDestructionBuffId = this.isDeva
      ? SPELLS.IMMINENT_DESTRUCTION_DEV_BUFF.id
      : SPELLS.IMMINENT_DESTRUCTION_AUG_BUFF.id;

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DISINTEGRATE, TALENTS.PYRE_TALENT, TALENTS.ERUPTION_TALENT]),
      this.onCast,
    );

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DISINTEGRATE, SPELLS.PYRE, TALENTS.ERUPTION_TALENT]),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    if (isCastFromEB(event) || !this.selectedCombatant.hasBuff(this.imminentDestructionBuffId)) {
      return;
    }

    switch (event.ability.guid) {
      case SPELLS.DISINTEGRATE.id: {
        this.disintegrateEssenceReduction += IMMINENT_DESTRUCTION_ESSENCE_REDUCTION;
        break;
      }
      case TALENTS.PYRE_TALENT.id: {
        this.pyreEssenceReduction += IMMINENT_DESTRUCTION_ESSENCE_REDUCTION;
        break;
      }
      case TALENTS.ERUPTION_TALENT.id: {
        this.eruptionEssenceReduction += IMMINENT_DESTRUCTION_ESSENCE_REDUCTION;
        break;
      }
    }
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(this.imminentDestructionBuffId)) {
      return;
    }

    const effAmount = calculateEffectiveDamage(event, IMMINENT_DESTRUCTION_MULTIPLIER);

    switch (event.ability.guid) {
      case SPELLS.DISINTEGRATE.id: {
        this.disintegrateDamage += effAmount;
        break;
      }
      case SPELLS.PYRE.id: {
        this.pyreDamage += effAmount;
        break;
      }
      case TALENTS.ERUPTION_TALENT.id: {
        this.eruptionDamage += effAmount;
        break;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.isDeva ? (
              <>
                <li>
                  <SpellLink spell={SPELLS.DISINTEGRATE} /> Damage:{' '}
                  {formatNumber(this.disintegrateDamage)}
                </li>
                <li>
                  <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> saved:{' '}
                  {formatNumber(this.disintegrateEssenceReduction)}
                </li>
                <br />

                <li>
                  <SpellLink spell={SPELLS.PYRE} /> Damage: {formatNumber(this.pyreDamage)}
                </li>
                <li>
                  <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> saved:{' '}
                  {formatNumber(this.pyreEssenceReduction)}
                </li>
              </>
            ) : (
              <>
                <li>
                  <SpellLink spell={TALENTS.ERUPTION_TALENT} /> Damage:{' '}
                  {formatNumber(this.eruptionDamage)}
                </li>
              </>
            )}
          </>
        }
      >
        <TalentSpellText
          talent={
            this.isDeva
              ? TALENTS.IMMINENT_DESTRUCTION_DEVASTATION_TALENT
              : TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT
          }
        >
          <ItemDamageDone
            amount={this.disintegrateDamage + this.pyreDamage + this.eruptionDamage}
          />
          <Soup />{' '}
          {this.disintegrateEssenceReduction +
            this.pyreEssenceReduction +
            this.eruptionEssenceReduction}{' '}
          <small>
            <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> saved
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ImminentDestruction;
