import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS/demonhunter';
import { formatPercentage } from 'common/format';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

export default class FieryBrand extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  hitsWithFB = 0;
  hitsWithoutFB = 0;
  hitsWithFBOffCD = 0;

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  get mitigatedUptime() {
    return formatPercentage(this.hitsWithFB / (this.hitsWithFB + this.hitsWithoutFB));
  }

  get hitsWithFBOffCDPercent() {
    return this.hitsWithFBOffCD / (this.hitsWithFB + this.hitsWithoutFB);
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: this.hitsWithFBOffCDPercent,
      isGreaterThan: {
        minor: 0.4,
        average: 0.6,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onDamageTaken(event: DamageEvent) {
    const enemy = this.enemies.getSourceEntity(event);
    if (!enemy) {
      return;
    }
    if (enemy.hasBuff(SPELLS.FIERY_BRAND_DOT.id)) {
      this.hitsWithFB += 1;
    } else {
      this.hitsWithoutFB += 1;

      if (this.spellUsable.isAvailable(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.id)) {
        this.hitsWithFBOffCD += 1;
      }
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          Cast <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.id} /> more regularly while
          actively tanking the boss or when they use a big attack. You missed having it up for{' '}
          {formatPercentage(this.hitsWithFBOffCDPercent)}% of hits.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.suggestions.fieryBrand.unmitgatedHits',
            message: `${formatPercentage(actual)}% unmitigated hits`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        tooltip={
          <>
            Fiery Brand usage breakdown:
            <ul>
              <li>
                You were hit <strong>{this.hitsWithFB}</strong> times by enemies with the Fiery
                Brand debuff.
              </li>
              <li>
                You were hit <strong>{this.hitsWithoutFB}</strong> times by enemies{' '}
                <strong>
                  <em>without</em>
                </strong>{' '}
                the Fiery Brand debuff.
              </li>
              <li>
                You were hit <strong>{this.hitsWithFBOffCD}</strong> times by enemies{' '}
                <strong>
                  <em>with</em>
                </strong>{' '}
                Fiery Brand available for use but not used.
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.id}>
          <>
            {this.mitigatedUptime}% <small>hits mitigated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
