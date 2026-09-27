import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SPECS from 'game/SPECS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import AspectOfHarmonyBaseAnalyzer from './AspectOfHarmonyBase';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// mistweaver gains the damage, brewmaster gains the healing
class HarmonicGambit extends Analyzer.withDependencies({
  aspectOfHarmony: AspectOfHarmonyBaseAnalyzer,
}) {
  talent = TALENTS_MONK.HARMONIC_GAMBIT_TALENT;
  isMistweaver = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.isMistweaver = this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;
  }

  get healing() {
    return this.isMistweaver ? 0 : this.deps.aspectOfHarmony.healing;
  }

  get damage() {
    return this.isMistweaver ? this.deps.aspectOfHarmony.damage : 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            The{' '}
            <SpellLink
              spell={
                this.isMistweaver ? SPELLS.ASPECT_OF_HARMONY_DOT : SPELLS.ASPECT_OF_HARMONY_HOT
              }
            />{' '}
            {this.isMistweaver ? 'damage' : 'healing'} that only happens because of this talent.
          </>
        }
      >
        <TalentSpellText talent={this.talent}>
          {this.isMistweaver ? (
            <ItemDamageDone amount={this.damage} />
          ) : (
            <ItemHealingDone amount={this.healing} />
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HarmonicGambit;
