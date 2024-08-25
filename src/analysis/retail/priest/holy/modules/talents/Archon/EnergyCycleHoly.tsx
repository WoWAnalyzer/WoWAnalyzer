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

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122

const APOTH_MULTIPIER = 4;
const ENERGY_CYCLE_CDR = 4;
const LIGHT_OF_THE_NAARU_REDUCTION_PER_RANK = 0.1;
const TWW_TIER1_2PC_CDR = 0.1;

class EnergyCycleHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  protected combatants!: Combatants;
  protected spellUsable!: SpellUsable;

  //Energy Cycle Ideal - no lost CDR from capping used to calc lost CDR
  energyCycleCDRIdeal = 0;
  energyCycleCDRActual = 0;

  private baseHolyWordCDR = 1;
  private modHolyWordCDR = 1;
  private apothBuffActive = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.ENERGY_CYCLE_TALENT);
    // these two if statements get the scaling CDR for holy word reduction
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
  }

  onSurgeOfLightHeal(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    // linked heal event exists from surge of light consumption
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
  //ENERGY CYCLE VALUES
  passWastedEnergyCycleCDR(): number {
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
            {formatNumber(this.energyCycleCDRActual)}s<small> reduced from Sanctify</small> <br />
            {this.passWastedEnergyCycleCDR()}s<small> wasted</small> <br />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EnergyCycleHoly;
