import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import PlayerHits from 'parser/ui/PlayerHits';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import SpellLink from 'interface/SpellLink';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GapHighlight } from 'parser/ui/CooldownBar';

class HolyPrismTargetsHit extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  casts = 0;
  targetsHit = 0;
  petsHit = 0;
  averageInjuredHumansHit = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.HOLY_PRISM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_PRISM_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_PRISM_HEAL),
      this.onAoEHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_PRISM_HEAL_DIRECT),
      this.onSTHeal,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  // We don't care about these but we can't filter (easily) only AOE casts as they all come from the same spell
  onSTHeal() {
    this.casts -= 1;
  }

  onAoEHeal(event: HealEvent) {
    const pet = this.combatants.getEntities()[event.targetID];
    const injured = event.amount + (event.absorbed || 0) !== 0;

    this.targetsHit += 1;
    if (!pet) {
      this.petsHit += 1;
    }
    if (pet && injured) {
      this.averageInjuredHumansHit += 1;
    }
  }

  statistic() {
    const averageTargetsHit = (this.targetsHit / this.casts).toFixed(2);
    const averagePetsHit = (this.petsHit / this.casts).toFixed(2);
    const averageHurtHumansHit = (this.averageInjuredHumansHit / this.casts).toFixed(2);

    return (
      <Statistic
        key="Statistic"
        category={STATISTIC_CATEGORY.TALENTS}
        size="small"
        tooltip={
          <>
            Casts are AoE only Casts
            <br />
            Targets hit are ALL targets Hit including 100% overhealing
            <br />
            Pets hit are ONLY pets Hit including 100% overheal
            <br />
            Hurt Non-Pets hit are all non pets excluding 100% overheal
            <ul>
              <li>Casts: {this.casts}</li>
              <li>
                Target hit: {this.targetsHit} ({averageTargetsHit}){' '}
              </li>
              <li>
                Pets Hit: {this.petsHit} ({averagePetsHit})
              </li>
              <li>
                Hurt Non-Pets Hit: {this.averageInjuredHumansHit} ({averageHurtHumansHit})
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.HOLY_PRISM_TALENT.id}
          value={averageTargetsHit}
          label="Average Targets Hit per Cast"
          className="light-of-dawn-hits-per-cast"
          extra={<PlayerHits performance={Number(averageTargetsHit)} />}
        />
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} />
        </b>{' '}
        is a quite powerful AoE or Single Target heal depending on who you use it on. Most of the
        time, you should use it on the boss to trigger the AoE healing. Sometimes though, using it
        directly on an ally can save a life !
        {this.selectedCombatant.hasTalent(TALENTS.DIVINE_FAVOR_TALENT) && (
          <>
            {' '}
            It also procs <SpellLink spell={TALENTS.DIVINE_FAVOR_TALENT} />, which you should use on{' '}
            <SpellLink spell={SPELLS.HOLY_LIGHT} />.
          </>
        )}
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} /> cast efficiency
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
        spellId={TALENTS.HOLY_PRISM_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default HolyPrismTargetsHit;
