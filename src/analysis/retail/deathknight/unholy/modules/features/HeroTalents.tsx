import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

type HeroTree = 'rider' | 'sanlayn' | 'deathbringer' | 'unknown';

class HeroTalents extends Analyzer {
  private heroTree: HeroTree = 'unknown';

  constructor(options: Options) {
    super(options);

    if (
      this.selectedCombatant.hasTalent(TALENTS.RIDERS_CHAMPION_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.APOCALYPSE_NOW_TALENT)
    ) {
      this.heroTree = 'rider';
    } else if (
      this.selectedCombatant.hasTalent(TALENTS.GIFT_OF_THE_SANLAYN_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.PACT_OF_THE_SANLAYN_TALENT)
    ) {
      this.heroTree = 'sanlayn';
    } else if (this.selectedCombatant.hasTalent(TALENTS.PACT_OF_THE_DEATHBRINGER_TALENT)) {
      this.heroTree = 'deathbringer';
    }
  }

  get heroTreeName(): string {
    switch (this.heroTree) {
      case 'rider':
        return 'Rider of the Apocalypse';
      case 'sanlayn':
        return "San'layn";
      case 'deathbringer':
        return 'Deathbringer';
      default:
        return 'Unknown';
    }
  }

  get heroTreeDescription(): string {
    switch (this.heroTree) {
      case 'rider':
        return 'Summons the Four Horsemen to fight alongside you. Focuses on Army of the Dead and minion enhancement.';
      case 'sanlayn':
        return 'Vampiric powers that heal and empower through Vampiric Strike. Blood Queen essence enhances your abilities.';
      case 'deathbringer':
        return "Enhances Reaper's Mark and execution damage. Focuses on dealing massive damage to weakened targets.";
      default:
        return 'No hero talent tree detected.';
    }
  }

  statistic() {
    if (this.heroTree === 'unknown') {
      return null;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={this.heroTreeDescription}
      >
        <div className="pad">
          <label>Hero Talent Tree</label>
          <div className="value">{this.heroTreeName}</div>
        </div>
      </Statistic>
    );
  }
}

export default HeroTalents;
