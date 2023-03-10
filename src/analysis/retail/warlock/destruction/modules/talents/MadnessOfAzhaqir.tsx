import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/warlock';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

interface BuffedSpellStats {
  buffedCasts: number;
  totalCasts: number;
  buffId: number;
  active: boolean;
  spell: Spell;
}

class MadnessOfAzhaqir extends Analyzer {
  static talent = TALENTS.MADNESS_OF_THE_AZJAQIR_TALENT;

  chaosBoltStats: BuffedSpellStats = {
    buffedCasts: 0,
    totalCasts: 0,
    buffId: SPELLS.MADNESS_OF_AZJAQIR_CHAOS_BOLT_BUFF.id,
    active: true,
    spell: SPELLS.CHAOS_BOLT,
  };

  rainOfFireStats: BuffedSpellStats = {
    buffedCasts: 0,
    totalCasts: 0,
    buffId: SPELLS.MADNESS_OF_AZJAQIR_RAIN_OF_FIRE_BUFF.id,
    active: this.selectedCombatant.hasTalent(TALENTS.RAIN_OF_FIRE_TALENT),
    spell: TALENTS.RAIN_OF_FIRE_TALENT,
  };

  shadowburnStats: BuffedSpellStats = {
    buffedCasts: 0,
    totalCasts: 0,
    buffId: SPELLS.MADNESS_OF_AZJAQIR_SHADOWBURN_BUFF.id,
    active: this.selectedCombatant.hasTalent(TALENTS.SHADOWBURN_TALENT),
    spell: TALENTS.SHADOWBURN_TALENT,
  };

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(MadnessOfAzhaqir.talent);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_BOLT),
      this.makeSpellEventListener(this.chaosBoltStats),
    );

    if (this.selectedCombatant.hasTalent(TALENTS.RAIN_OF_FIRE_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RAIN_OF_FIRE_TALENT),
        this.makeSpellEventListener(this.rainOfFireStats),
      );
    }

    if (this.selectedCombatant.hasTalent(TALENTS.SHADOWBURN_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOWBURN_TALENT),
        this.makeSpellEventListener(this.shadowburnStats),
      );
    }
  }

  makeSpellEventListener(stats: BuffedSpellStats) {
    return () => {
      stats.totalCasts += 1;
      if (this.selectedCombatant.hasBuff(stats.buffId)) {
        stats.buffedCasts += 1;
      }
    };
  }

  buffedCastsPercentage(stats: BuffedSpellStats) {
    return stats.buffedCasts / stats.totalCasts;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={MadnessOfAzhaqir.talent}>
          {this.statisticSection(this.chaosBoltStats)}
          {this.rainOfFireStats.active && (
            <>
              <br />
              {this.statisticSection(this.rainOfFireStats)}
            </>
          )}
          {this.shadowburnStats.active && (
            <>
              <br />
              {this.statisticSection(this.shadowburnStats)}
            </>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }

  statisticSection(stats: BuffedSpellStats) {
    return (
      <>
        {formatPercentage(this.buffedCastsPercentage(stats), 0)}%{' '}
        <TooltipElement content={`${stats.buffedCasts} / ${stats.totalCasts}`}>
          <small>{stats.spell.name} casts buffed</small>
        </TooltipElement>
      </>
    );
  }
}

export default MadnessOfAzhaqir;
