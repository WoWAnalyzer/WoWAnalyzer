import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  EMPOWER_SANDS_APPLY,
  FIRE_BREATH_INFERNOS_APPLY,
  EMERALD_BLOSSOM_SYMBIOTIC_APPLY,
  PRESCIENCE_BUFF_CAST_LINK,
} from '../normalizers/CastLinkNormalizer';
import Events, { ApplyBuffEvent, HasRelatedEvent, RefreshBuffEvent } from 'parser/core/Events';
import { VersatilityIcon } from 'interface/icons';
import DonutChart from 'parser/ui/DonutChart';
import { SpellLink } from 'interface';
import Combatants from 'parser/shared/modules/Combatants';
import classColor from 'game/classColor';
import Combatant from 'parser/core/Combatant';
import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
/**
 * Eruption has a 25% chance to create a Mote of Possibility. Motes of Possibility can be consumed to grant a player Shifting Sands, Inferno's Blessing, or Symbiotic Bloom at random.
 * Clairvoyant: Chance increased to 35%, and can instead grant Prescience.
 */
class MotesOfPossibility extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  sandsMotes = 0;
  infernoMotes = 0;
  blossomMotes = 0;
  prescienceMotes = 0;
  moteCount = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.MOTES_OF_POSSIBILITY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_SANDS_BUFF),
      this.OnSandsApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_SANDS_BUFF),
      this.OnSandsApply,
    );

    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.INFERNOS_BLESSING_TALENT)) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_BUFF),
        this.OnInfernosApplyWithTalent,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_BUFF),
        this.OnInfernosApplyWithTalent,
      );
    } else {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_BUFF),
        this.OnInfernosApply,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNOS_BLESSING_BUFF),
        this.OnInfernosApply,
      );
    }

    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.SYMBIOTIC_BLOOM_TALENT)) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOM_BUFF),
        this.OnSymbioticApplyWithTalent,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOM_BUFF),
        this.OnSymbioticApplyWithTalent,
      );
    } else {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOM_BUFF),
        this.OnSymbioticApply,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOM_BUFF),
        this.OnSymbioticApply,
      );
    }

    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.CLAIRVOYANT_TALENT)) {
      if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.PRESCIENCE_TALENT)) {
        this.addEventListener(
          Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
          this.OnPrescienceApplyWithTalent,
        );
        this.addEventListener(
          Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
          this.OnPrescienceApplyWithTalent,
        );
      } else {
        this.addEventListener(
          Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
          this.OnPrescienceApply,
        );
        this.addEventListener(
          Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.PRESCIENCE_BUFF),
          this.OnPrescienceApply,
        );
      }
    }
  }

  OnMotesApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (event.targetID === undefined) {
      console.warn(
        'MotesOfPossibility module received an event with no targetID',
        event.ability.name +
          `(${event.ability.guid}) @` +
          this.owner.formatTimestamp(event.timestamp),
      );
      return;
    }
    this.moteCount.set(event.targetID, (this.moteCount.get(event.targetID) || 0) + 1);
  }

  OnSandsApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!HasRelatedEvent(event, EMPOWER_SANDS_APPLY)) {
      this.sandsMotes += 1;
      this.OnMotesApply(event);
    }
  }

  OnInfernosApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.infernoMotes += 1;
    this.OnMotesApply(event);
  }

  OnInfernosApplyWithTalent(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!HasRelatedEvent(event, FIRE_BREATH_INFERNOS_APPLY)) {
      this.infernoMotes += 1;
      this.OnMotesApply(event);
    }
  }

  OnSymbioticApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.blossomMotes += 1;
    this.OnMotesApply(event);
  }

  OnSymbioticApplyWithTalent(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!HasRelatedEvent(event, EMERALD_BLOSSOM_SYMBIOTIC_APPLY)) {
      this.blossomMotes += 1;
      this.OnMotesApply(event);
    }
  }

  OnPrescienceApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.prescienceMotes += 1;
    this.OnMotesApply(event);
  }

  OnPrescienceApplyWithTalent(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!HasRelatedEvent(event, PRESCIENCE_BUFF_CAST_LINK)) {
      this.prescienceMotes += 1;
      this.OnMotesApply(event);
    }
  }

  getClassColorForTarget(target: Combatant): string {
    let classStr = '#000000';
    let className = '';
    if (classColor(target)) {
      className = classColor(target);
    }
    if (className === 'DeathKnight') {
      classStr = '#C41E3A';
    } else if (className === 'DemonHunter') {
      classStr = '#A330C9';
    } else if (className === 'Druid') {
      classStr = '#FF7C0A';
    } else if (className === 'Evoker') {
      classStr = '#33937F';
    } else if (className === 'Hunter') {
      classStr = '#AAD372';
    } else if (className === 'Mage') {
      classStr = '#3FC7EB';
    } else if (className === 'Monk') {
      classStr = '#00FF98';
    } else if (className === 'Paladin') {
      classStr = '#F48CBA';
    } else if (className === 'Priest') {
      classStr = '#FFFFFF';
    } else if (className === 'Rogue') {
      classStr = '#FFF468';
    } else if (className === 'Shaman') {
      classStr = '#0070DD';
    } else if (className === 'Warlock') {
      classStr = '#8788EE';
    } else if (className === 'Warrior') {
      classStr = '#C69B6D';
    }
    return classStr;
  }

  statistic() {
    let moteChart;
    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.CLAIRVOYANT_TALENT)) {
      moteChart = [
        {
          color: 'rgb(255, 255, 0)',
          label: SPELLS.SHIFTING_SANDS_BUFF.name,
          spellId: SPELLS.SHIFTING_SANDS_BUFF.id,
          valueTooltip: this.sandsMotes,
          value: this.sandsMotes,
        },
        {
          color: 'rgb(254, 59, 59)',
          label: SPELLS.INFERNOS_BLESSING_BUFF.name,
          spellId: SPELLS.INFERNOS_BLESSING_BUFF.id,
          valueTooltip: this.infernoMotes,
          value: this.infernoMotes,
        },
        {
          color: 'rgb(46, 139, 87)',
          label: SPELLS.SYMBIOTIC_BLOOM_BUFF.name,
          spellId: SPELLS.SYMBIOTIC_BLOOM_BUFF.id,
          valueTooltip: this.blossomMotes,
          value: this.blossomMotes,
        },
        {
          color: 'rgb(253, 206, 86)',
          label: TALENTS.PRESCIENCE_TALENT.name,
          spellId: TALENTS.PRESCIENCE_TALENT.id,
          valueTooltip: this.prescienceMotes,
          value: this.prescienceMotes,
        },
      ];
    } else {
      moteChart = [
        {
          color: 'rgb(255, 255, 0)',
          label: SPELLS.SHIFTING_SANDS_BUFF.name,
          spellId: SPELLS.SHIFTING_SANDS_BUFF.id,
          valueTooltip: this.sandsMotes,
          value: this.sandsMotes,
        },
        {
          color: 'rgb(254, 59, 59)',
          label: SPELLS.INFERNOS_BLESSING_BUFF.name,
          spellId: SPELLS.INFERNOS_BLESSING_BUFF.id,
          valueTooltip: this.infernoMotes,
          value: this.infernoMotes,
        },
        {
          color: 'rgb(46, 139, 87)',
          label: SPELLS.SYMBIOTIC_BLOOM_BUFF.name,
          spellId: SPELLS.SYMBIOTIC_BLOOM_BUFF.id,
          valueTooltip: this.blossomMotes,
          value: this.blossomMotes,
        },
      ];
    }

    const targetChart = [];
    const sortedMoteMap = new Map([...this.moteCount.entries()].sort((a, b) => b[1] - a[1]));
    for (const [targetID, count] of sortedMoteMap.entries()) {
      const target = this.combatants.players[targetID];
      console.log(classColor(target));
      if (target) {
        let targetLabel = target.name;
        if (target.spec?.role === ROLES.TANK) {
          targetLabel += ' (Tank)';
        } else if (target.spec?.role === ROLES.HEALER) {
          targetLabel += ' (Healer)';
        } else if (target.spec === SPECS.AUGMENTATION_EVOKER) {
          targetLabel += ' (Aug)';
        }
        targetChart.push({
          color: this.getClassColorForTarget(target),
          label: targetLabel,
          spellId: 0,
          valueTooltip: count,
          value: count,
        });
      }
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <>
            <div className="pad">
              <label>Buff breakdown</label>
              <DonutChart items={moteChart} />
            </div>
            <div className="pad">
              <label>Target targets</label>
              <DonutChart items={targetChart} />
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.MOTES_OF_POSSIBILITY_TALENT}>
          <div>
            <VersatilityIcon />{' '}
            {this.sandsMotes + this.infernoMotes + this.blossomMotes + this.prescienceMotes}
            <small>
              {' '}
              <SpellLink spell={TALENTS.MOTES_OF_POSSIBILITY_TALENT} /> used
            </small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MotesOfPossibility;
