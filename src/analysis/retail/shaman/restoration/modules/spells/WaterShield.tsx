import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import ManaIcon from 'interface/icons/Mana';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// just gonna steal my mtt formatting
import './ManaTideTotem.scss';

const WATER_SHIELD_MANA_REGEN_PER_SECOND = 50 / 5;

class WaterShield extends Analyzer {
  manaGain = 0;
  prepullApplication = false;

  constructor(options: Options) {
    super(options);
    // Disable Water Shield because its just fucking broken
    this.active = false;

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD_ENERGIZE),
      this.waterShield,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.WATER_SHIELD_TALENT),
      this.waterShieldPrepullCheck,
    );
  }

  waterShield(event: ResourceChangeEvent) {
    this.manaGain += event.resourceChange;
  }

  waterShieldPrepullCheck(event: ApplyBuffEvent) {
    if (event.prepull) {
      this.prepullApplication = true;
    }
  }

  get regenOnPlayer() {
    let uptime =
      this.selectedCombatant.getBuffUptime(TALENTS.WATER_SHIELD_TALENT.id) /
      this.owner.fightDuration;
    if (uptime === 0) {
      uptime = 1; // quick fix for water shield not being in logs
    }

    return (this.owner.fightDuration / 1000) * WATER_SHIELD_MANA_REGEN_PER_SECOND * uptime;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(TALENTS.WATER_SHIELD_TALENT.id);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsPrepull() {
    return {
      actual: this.prepullApplication,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  statistic() {
    return (
      <Statistic size="flexible" position={STATISTIC_ORDER.UNIMPORTANT(88)}>
        <BoringValue label={<SpellLink id={TALENTS.WATER_SHIELD_TALENT.id} />}>
          <div className="flex mtt-value">
            <div className="flex-sub icon">
              <ManaIcon />
            </div>
            <div className="flex-main value">
              {formatNumber(this.regenOnPlayer + this.manaGain)}
              <br />
              <small>
                <TooltipElement
                  content={
                    <Trans id="shaman.restoration.waterShield.statistic.tooltip">
                      {formatNumber(this.regenOnPlayer)} mana from the passive regen and{' '}
                      {this.manaGain} from getting hit
                    </Trans>
                  }
                >
                  <Trans id="shaman.restoration.manaTideTotem.statistic.manaRestored">
                    Mana restored
                  </Trans>
                </TooltipElement>
              </small>
            </div>
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}

export default WaterShield;
