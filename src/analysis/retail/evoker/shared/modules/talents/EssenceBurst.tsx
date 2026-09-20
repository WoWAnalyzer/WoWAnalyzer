import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import {
  EBSource,
  EBSourceType,
  getEBSource,
  getEssenceBurstConsumeAbility,
} from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  didSparkProcEssenceBurst,
  isEbFromHardcast,
  isEbFromMerithras,
  isEbFromReversion,
} from 'analysis/retail/evoker/preservation/normalizers/EventLinking/helpers';
import { getImminentDestructionConsumeEvent } from '../normalizers/ImminentDestructionCastLinkNormalizer';
import { BadColor } from 'interface/guide';

interface ConsumerData {
  manaCost: number;
  essenceCost: number;
  consumptions: number;
}

export enum EB_SOURCE {
  PRESCIENCE,
  AZURESTRIKE,
  LIVINGFLAMECAST,
  LIVINGFLAMEHEAL,
  DIVERTEDPOWER,
  ESSENCEWELL,
  UNBOUNDFLAME,
  //Pres
  REVERSION,
  SPARK,
  LF_HARDCAST,
  MERITHRAS,
  NONE,
}

interface CastInfo {
  spell: number;
  expired: number;
  refreshed: boolean;
  timestamp: number;
  source: EB_SOURCE;
}

abstract class EssenceBurstBase extends Analyzer {
  consumers: Record<string, ConsumerData> = {
    'Emerald Blossom': {
      manaCost: SPELLS.EMERALD_BLOSSOM_CAST.manaCost,
      essenceCost: SPELLS.EMERALD_BLOSSOM_CAST.essenceCost,
      consumptions: 0,
    },
    Echo: {
      manaCost: TALENTS_EVOKER.ECHO_TALENT.manaCost,
      essenceCost: TALENTS_EVOKER.ECHO_TALENT.essenceCost,
      consumptions: 0,
    },
    Eruption: {
      manaCost: 0,
      essenceCost: TALENTS_EVOKER.ERUPTION_TALENT.essenceCost,
      consumptions: 0,
    },
    Disintegrate: {
      manaCost: 0,
      essenceCost: 3,
      consumptions: 0,
    },
    Pyre: {
      manaCost: 0,
      essenceCost: TALENTS_EVOKER.PYRE_TALENT.essenceCost,
      consumptions: 0,
    },
  };

  activeStacks = 0;
  maxStacks = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ESSENCE_ATTUNEMENT_TALENT) ? 2 : 1;
  totalConsumed = 0;
  totalExpired = 0;
  essenceSaved = 0;
  manaSaved = 0;
  casts: CastInfo[] = [];

  isDev =
    this.selectedCombatant.hasTalent(TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT) ||
    this.selectedCombatant.hasTalent(TALENTS_EVOKER.AZURE_ESSENCE_BURST_TALENT);
  isAug = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_AUGMENTATION_TALENT);
  isPres = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT);

  constructor(options: Options) {
    super(options);
    this.active = this.isDev || this.isAug || this.isPres;

    [Events.applybuffstack, Events.applybuff].forEach((event) => {
      this.addEventListener(
        event
          .by(SELECTED_PLAYER)
          .spell([TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT, SPELLS.ESSENCE_BURST_DEV_BUFF]),
        this.onApplyBuff,
      );
    });
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT, SPELLS.ESSENCE_BURST_DEV_BUFF]),
      this.onBuffRemove,
    );
    this.addEventListener(
      Events.refreshbuff
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT, SPELLS.ESSENCE_BURST_DEV_BUFF]),
      this.onBuffRefresh,
    );

    if (this.maxStacks === 2) {
      this.addEventListener(
        Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
        this.onBuffRemove,
      );
    }

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onApplyBuff(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (event.type === 'applybuffstack' && event.stack) {
      this.activeStacks = event.stack;
    } else {
      this.activeStacks = Math.min(this.activeStacks + 1, this.maxStacks);
    }
  }

  private remapSources(source: EBSourceType | undefined): EB_SOURCE {
    switch (source) {
      case EBSource.Prescience:
        return EB_SOURCE.PRESCIENCE;
      case EBSource.AzureStrike:
        return EB_SOURCE.AZURESTRIKE;
      case EBSource.LivingFlameCast:
        return EB_SOURCE.LIVINGFLAMECAST;
      case EBSource.LivingFlameHeal:
        return EB_SOURCE.LIVINGFLAMEHEAL;
      case EBSource.DivertedPower:
        return EB_SOURCE.DIVERTEDPOWER;
      case EBSource.EssenceWell:
        return EB_SOURCE.ESSENCEWELL;
      case EBSource.UnboundFlame:
        return EB_SOURCE.UNBOUNDFLAME;
      default:
        return EB_SOURCE.NONE;
    }
  }

  private getEbSource(event: RemoveBuffEvent | RemoveBuffStackEvent | RefreshBuffEvent): EB_SOURCE {
    let source = EB_SOURCE.NONE;

    if (this.isPres) {
      if (didSparkProcEssenceBurst(event)) {
        source = EB_SOURCE.SPARK;
      } else if (isEbFromReversion(event)) {
        source = EB_SOURCE.REVERSION;
      } else if (isEbFromMerithras(event)) {
        source = EB_SOURCE.MERITHRAS;
      } else if (isEbFromHardcast(event)) {
        source = EB_SOURCE.LF_HARDCAST;
      }
    } else {
      source = this.remapSources(getEBSource(event));
    }

    return source;
  }

  private checkEssenceReduction(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    return this.isPres ? false : getImminentDestructionConsumeEvent(event);
  }

  private onBuffRemove(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const consumeAbility = getEssenceBurstConsumeAbility(event);

    const info: CastInfo = {
      timestamp: event.timestamp,
      expired: 0,
      refreshed: false,
      spell: 0,
      source: this.getEbSource(event),
    };

    if (consumeAbility) {
      const spellName = consumeAbility.ability.name;
      info.spell = consumeAbility.ability.guid;
      this.totalConsumed += 1;
      this.essenceSaved += this.checkEssenceReduction(event)
        ? this.consumers[spellName].essenceCost - 1
        : this.consumers[spellName].essenceCost;
      this.manaSaved += this.consumers[spellName].manaCost;
      this.consumers[spellName].consumptions += 1;
    } else if (event.type === EventType.RemoveBuff) {
      this.totalExpired += this.activeStacks;
      info.expired = this.activeStacks;
      this.activeStacks = 0;
    } else {
      this.totalExpired += event.stack;
      info.expired = this.activeStacks;
      this.activeStacks -= event.stack;
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary:
          'Essence Burst stack decayed without consume event (Should be a RemoveBuff if it decays)',
      });
    }
    this.casts.push(info);
  }

  private onBuffRefresh(event: RefreshBuffEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MERITHRAS_BLESSING_BUFF.id, event.timestamp - 1)) {
      this.casts.push({
        timestamp: event.timestamp,
        expired: 0,
        refreshed: true,
        spell: 0,
        source: this.getEbSource(event),
      });
    }
  }

  private onFightEnd(event: FightEndEvent) {
    if (this.activeStacks > 0) {
      this.casts.push({
        timestamp: event.timestamp,
        expired: this.activeStacks,
        refreshed: false,
        spell: 0,
        source: EB_SOURCE.NONE,
      });
    }
  }

  abstract get guideSubsection(): JSX.Element;
}

export default EssenceBurstBase;
