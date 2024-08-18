import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SpellLink from 'interface/SpellLink';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

export class BlessingOfTheSeasons extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_SUMMER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.spell(SPELLS.BLESSING_OF_AUTUMN_TALENT).to(SELECTED_PLAYER),
      this.onApplyAutumn,
    );
    this.addEventListener(
      Events.removebuff.spell(SPELLS.BLESSING_OF_AUTUMN_TALENT).to(SELECTED_PLAYER),
      this.onRemoveAutumn,
    );
  }

  onApplyAutumn() {
    this.spellUsable.applyCooldownRateChange('ALL', 1.3);
  }

  onRemoveAutumn() {
    this.spellUsable.removeCooldownRateChange('ALL', 1.3);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS.BLESSING_OF_SUMMER_TALENT} />
          </b>{' '}
          is a unique ability that cycles through 4 different buffs.{' '}
          <SpellLink spell={SPELLS.BLESSING_OF_AUTUMN_TALENT} /> provides pretty minor CDR, you can
          throw it on whoever you want including you.{' '}
          <SpellLink spell={SPELLS.BLESSING_OF_WINTER_TALENT} /> is your main mana refund tool, you
          should use it on yourself more often than not. Finally,{' '}
          <SpellLink spell={SPELLS.BLESSING_OF_SPRING_TALENT} /> gives a nice healing boost that you
          probably would want to keep for yourself.
        </p>
        <p>
          <SpellLink spell={TALENTS.BLESSING_OF_SUMMER_TALENT} /> is the most powerful one and
          converts healing into damage and vice versa. It has two use cases : either you use it on
          someone's that is actively healing to proc damage. Or you want to do healing and you can
          throw it on a non-pet DPS spec in cooldowns.
        </p>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.BLESSING_OF_SUMMER_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.BLESSING_OF_SUMMER_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}
