import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  ApplyDebuffEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

interface DiseaseState {
  hasVirulentPlague: boolean;
  hasDreadPlague: boolean;
  lastVirulentApply: number;
  lastDreadApply: number;
}

class DiseaseDetonation extends Analyzer {
  private pestilenceCasts = 0;
  private pestilenceDamage = 0;
  private detonationsWithBothDiseases = 0;
  private detonationsWithOnlyOne = 0;
  private detonationsWithNone = 0;
  private diseaseStates: Map<string, DiseaseState> = new Map();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PESTILENCE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE),
      this.onVirulentApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE),
      this.onVirulentApply,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.DREAD_PLAGUE),
      this.onDreadApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.DREAD_PLAGUE),
      this.onDreadApply,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PESTILENCE),
      this.onPestilenceCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PESTILENCE),
      this.onPestilenceDamage,
    );
  }

  private getOrCreateDiseaseState(targetString: string): DiseaseState {
    if (!this.diseaseStates.has(targetString)) {
      this.diseaseStates.set(targetString, {
        hasVirulentPlague: false,
        hasDreadPlague: false,
        lastVirulentApply: 0,
        lastDreadApply: 0,
      });
    }
    return this.diseaseStates.get(targetString)!;
  }

  onVirulentApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const state = this.getOrCreateDiseaseState(targetString);
    state.hasVirulentPlague = true;
    state.lastVirulentApply = event.timestamp;
  }

  onDreadApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const state = this.getOrCreateDiseaseState(targetString);
    state.hasDreadPlague = true;
    state.lastDreadApply = event.timestamp;
  }

  onPestilenceCast(event: CastEvent) {
    this.pestilenceCasts += 1;

    let targetsWithBoth = 0;
    let targetsWithOne = 0;
    let targetsWithNone = 0;

    this.diseaseStates.forEach((state) => {
      if (state.hasVirulentPlague && state.hasDreadPlague) {
        targetsWithBoth += 1;
      } else if (state.hasVirulentPlague || state.hasDreadPlague) {
        targetsWithOne += 1;
      } else {
        targetsWithNone += 1;
      }
    });

    if (targetsWithBoth > 0) {
      this.detonationsWithBothDiseases += 1;
    } else if (targetsWithOne > 0) {
      this.detonationsWithOnlyOne += 1;
    } else {
      this.detonationsWithNone += 1;
    }

    this.diseaseStates.forEach((state) => {
      state.hasVirulentPlague = false;
      state.hasDreadPlague = false;
    });
  }

  onPestilenceDamage(event: DamageEvent) {
    this.pestilenceDamage += event.amount + (event.absorbed || 0);
  }

  get averageDamagePerCast(): number {
    if (this.pestilenceCasts === 0) {
      return 0;
    }
    return this.pestilenceDamage / this.pestilenceCasts;
  }

  get goodDetonationPercentage(): number {
    if (this.pestilenceCasts === 0) {
      return 0;
    }
    return this.detonationsWithBothDiseases / this.pestilenceCasts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Pestilence consumes all plagues and deals their remaining damage instantly. For maximum
            burst, ensure both Dread Plague and Virulent Plague are active.
            <br />
            <br />
            <strong>Detonation Quality:</strong>
            <ul>
              <li>With both diseases: {this.detonationsWithBothDiseases}</li>
              <li>With only one disease: {this.detonationsWithOnlyOne}</li>
              <li>With no diseases: {this.detonationsWithNone}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.PESTILENCE}>
          <>
            <ItemDamageDone amount={this.pestilenceDamage} />
            <br />
            {this.pestilenceCasts} <small>detonations</small>
            <br />
            {(this.goodDetonationPercentage * 100).toFixed(0)}% <small>with both diseases</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DiseaseDetonation;
