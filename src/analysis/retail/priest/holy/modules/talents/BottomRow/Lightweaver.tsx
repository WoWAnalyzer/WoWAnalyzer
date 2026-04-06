import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/';
import TALENTS from 'common/TALENTS/priest';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';
import { getHeal } from '../../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../../Guide';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { LW_CAST_TIME_DECREASE } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import styles from '../../Styling.module.scss';

class Lightweaver extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;

  totalFlashHealCasts = 0;
  wastedBuffFlashHealCasts = 0;
  surgeOfLightFlashHealCasts = 0;

  trailHealing = 0;
  bindingHealing = 0;
  prayerHealing = 0;
  eolContrib = 0;

  get totalHealing() {
    return this.prayerHealing + this.eolContrib + this.trailHealing + this.bindingHealing;
  }

  constructor(options: Options) {
    super(options);

    if (!this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL),
      this.onFlashHealCast,
    );
  }

  onFlashHealCast(event: CastEvent) {
    const healEvent = getHeal(event);
    if (!healEvent) {
      return;
    }

    this.totalFlashHealCasts += 1;

    const hasSurgeBuff = this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_LIGHT_BUFF.id);
    const lightweaverStacks = this.selectedCombatant.getBuffStacks(
      SPELLS.LIGHTWEAVER_TALENT_BUFF.id,
    );

    if (hasSurgeBuff) {
      this.surgeOfLightFlashHealCasts += 1;
    } else if (lightweaverStacks >= 4) {
      this.wastedBuffFlashHealCasts += 1;
    }
  }

  get goodFlashHeals() {
    return (
      this.totalFlashHealCasts - this.wastedBuffFlashHealCasts - this.surgeOfLightFlashHealCasts
    );
  }

  get guideSubsection(): JSX.Element {
    if (!this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT)) {
      return <></>;
    }
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />
        </b>{' '}
        increases healing of <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> and reduces its
        mana cost. Try to cast <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> more often to
        consume <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> stacks and save mana in situations
        when at least three party members are injured.
      </p>
    );

    const goodFlashHeals = {
      count: this.goodFlashHeals,
      label: 'Good Flash Heal casts',
    };

    const surgeFlashHeals = {
      count: this.surgeOfLightFlashHealCasts,
      label: 'Surge of Light Flash Heal casts',
    };

    const wastedFlashHeals = {
      count: this.wastedBuffFlashHealCasts,
      label: 'Flash Heal casts with four stacks of Lightweaver already',
    };

    const data = (
      <div>
        <strong>
          <SpellLink spell={SPELLS.FLASH_HEAL} /> cast breakdown
        </strong>
        <small>
          {' '}
          – <span className={styles.goodCast}>Green</span> is a good cast.{' '}
          <span className={styles.okCast}>Yellow</span> is a cast with Surge of Light buff.{' '}
          <span className={styles.badCast}>Red</span> is a cast with four stacks of{' '}
          <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> already active.
        </small>
        <GradiatedPerformanceBar
          good={goodFlashHeals}
          ok={surgeFlashHeals}
          bad={wastedFlashHeals}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div style={{ marginBottom: '0.5rem' }}>Breakdown:</div>
            <div>
              <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.prayerHealing} />
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib} />
            </div>
            <div>
              <SpellLink spell={SPELLS.TRAIL_OF_LIGHT_TALENT_HEAL} />:{' '}
              <ItemPercentHealingDone amount={this.trailHealing} />
            </div>
            <div>
              <SpellLink spell={SPELLS.BINDING_HEALS_TALENT_HEAL} />:{' '}
              <ItemPercentHealingDone amount={this.bindingHealing} />
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.LIGHTWEAVER_TALENT}>
          <div>
            <ItemHealingDone amount={this.totalHealing} /> <small> from just the heal amp</small>
          </div>
          <div>
            <ItemHealingDone amount={this.totalHealing / LW_CAST_TIME_DECREASE} />{' '}
            <small> from both the heal amp and doing that healing in less time</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Lightweaver;
