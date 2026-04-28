import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { isFromFieldOfDreams } from '../../normalizers/EventLinking/helpers';

class FieldOfDreams extends Analyzer {
  countedTimestamps: Set<number> = new Set<number>();
  numProcs = 0;
  totalBlossomHealing = 0;
  totalBlossomOverhealing = 0;
  totalSeedlingsHealing = 0;
  totalSeedlingsOverhealing = 0;
  latestTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT);
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.EMERALD_BLOSSOM, SPELLS.FLUTTERING_SEEDLINGS_HEAL]),
      this.onFodHeal,
    );
  }

  onFodHeal(event: HealEvent) {
    if (isFromFieldOfDreams(event)) {
      if (event.ability.guid == SPELLS.EMERALD_BLOSSOM.id) {
        this.totalBlossomHealing += event.amount + (event.absorbed || 0);
        this.totalBlossomOverhealing += event.overheal || 0;
      } else {
        this.totalSeedlingsHealing += event.amount + (event.absorbed || 0);
        this.totalSeedlingsOverhealing += event.overheal || 0;
      }
      if (event.timestamp > this.latestTimestamp + 50) {
        this.numProcs += 1;
        this.latestTimestamp = event.timestamp;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <SpellLink spell={SPELLS.EMERALD_BLOSSOM} />
            <ul>
              <li>{formatNumber(this.totalBlossomHealing)} effective healing</li>
              <li>{formatNumber(this.totalBlossomOverhealing)} overheal</li>
            </ul>
            <SpellLink spell={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT} />
            <ul>
              <li>{formatNumber(this.totalSeedlingsHealing)} effective healing</li>
              <li>{formatNumber(this.totalSeedlingsOverhealing)} overheal</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT}>
          <div>
            <small>
              <SpellLink spell={SPELLS.EMERALD_BLOSSOM} />
            </small>
          </div>
          <ItemHealingDone amount={this.totalBlossomHealing} />
          <div>
            <small>
              <SpellLink spell={TALENTS_EVOKER.FLUTTERING_SEEDLINGS_TALENT} />
            </small>
          </div>
          <ItemHealingDone amount={this.totalSeedlingsHealing} />
          <div>
            <small>
              {this.numProcs} extra <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> procs
            </small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FieldOfDreams;
