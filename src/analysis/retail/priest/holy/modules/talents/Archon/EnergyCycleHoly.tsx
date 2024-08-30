import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatNumber } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

import { TALENTS_PRIEST } from 'common/TALENTS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TIERS } from 'game/TIERS';
import Events, { RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { buffedBySurgeOfLight, getHealFromSurge } from '../../../normalizers/CastLinkNormalizer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import {
  APOTH_MULTIPIER,
  ENERGY_CYCLE_CDR,
  LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK,
  TWW_TIER1_2PC_CDR,
} from './ArchonValues';

class EnergyCycleHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  protected combatants!: Combatants;
  protected spellUsable!: SpellUsable;

  //Energy Cycle Ideal is no lost CDR from overcapping CD
  energyCycleCDRIdeal = 0;
  energyCycleCDRActual = 0;

  private baseHolyWordCDR = 1;
  private modHolyWordCDR = 1;
  private apothBuffActive = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.ENERGY_CYCLE_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT)) {
      this.baseHolyWordCDR =
        this.selectedCombatant.getTalentRank(TALENTS_PRIEST.LIGHT_OF_THE_NAARU_TALENT) *
          LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK +
        1;
    }
    if (this.selectedCombatant.has2PieceByTier(TIERS.TWW1)) {
      this.baseHolyWordCDR *= TWW_TIER1_2PC_CDR + 1;
    }

    //these are used to check if CDR needs to be scaled for Energy Cycle
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.APOTHEOSIS_TALENT),
      this.applyApoth,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.APOTHEOSIS_TALENT),
      this.removeApoth,
    );

    //tracks spending of Surge of Light
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );
  }

  onSurgeOfLightHeal(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const healEvent = getHealFromSurge(event);

    if (healEvent) {
      if (buffedBySurgeOfLight(event)) {
        this.modHolyWordCDR = this.baseHolyWordCDR;
        if (this.apothBuffActive) {
          this.modHolyWordCDR *= APOTH_MULTIPIER;
        }

        this.energyCycleCDRIdeal += ENERGY_CYCLE_CDR * this.modHolyWordCDR;

        this.energyCycleCDRActual += this.spellUsable.reduceCooldown(
          SPELLS.HOLY_WORD_SANCTIFY.id,
          ENERGY_CYCLE_CDR * this.modHolyWordCDR,
        );
      }
    }
  }

  applyApoth() {
    this.apothBuffActive = true;
  }
  removeApoth() {
    this.apothBuffActive = false;
  }

  get passWastedEnergyCycleCDR(): number {
    return this.energyCycleCDRIdeal - this.energyCycleCDRActual;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.ENERGY_CYCLE_TALENT}>
          <div>
            {formatNumber(this.energyCycleCDRActual)}s
            <small>
              {' '}
              reduced from <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SANCTIFY_TALENT} />
            </small>{' '}
            <br />
            {this.passWastedEnergyCycleCDR}s<small> wasted</small> <br />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EnergyCycleHoly;
