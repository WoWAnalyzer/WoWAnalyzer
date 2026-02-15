import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';

export const EXS_CAST_TO_DAMAGE = 'explosive_cast_to_damage';
export const SV_MB_CLEAVE = 'mb_cleave';
export const STAMPEDE_READY_TO_DAMAGE = 'stampede_ready_to_damage';
export const BOAR_TO_HOGSTRIDER_DAMAGE = 'boar_to_hogstrider_damage';
export const BOAR_TO_KILL_COMMAND = 'boar_to_kill_command';
const stampedeDamageBuffer = 10_000;
const boarDamageBuffer = 5_000;
const links: EventLink[] = [
  {
    linkRelation: SV_MB_CLEAVE,
    linkingEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.HOGSTRIDER_BUFF.id,
    referencedEventType: EventType.Damage,
    referencedEventId: TALENTS.RAPTOR_STRIKE_TALENT.id,
    anyTarget: true,
    anySource: false,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
    maximumLinks: 5,
  },
  {
    linkRelation: STAMPEDE_READY_TO_DAMAGE,
    linkingEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.STAMPEDE_READY_BUFF.id,
    referencedEventType: EventType.Damage,
    referencedEventId: SPELLS.STAMPEDE_DAMAGE.id,
    anyTarget: true,
    anySource: false,
    forwardBufferMs: stampedeDamageBuffer,
    backwardBufferMs: 0,
    maximumLinks: 200,
  },
  {
    linkRelation: BOAR_TO_HOGSTRIDER_DAMAGE,
    linkingEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.HOWL_OF_THE_PACKLEADER_BOAR.id,
    referencedEventType: EventType.Damage,
    referencedEventId: [SPELLS.PL_HOGSTRIDER_DAMAGE_1.id, SPELLS.PL_HOGSTRIDER_DAMAGE_2.id],
    anyTarget: true,
    anySource: false,
    forwardBufferMs: boarDamageBuffer,
    backwardBufferMs: 0,
    maximumLinks: 50,
  },
  {
    linkRelation: BOAR_TO_KILL_COMMAND,
    linkingEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.HOWL_OF_THE_PACKLEADER_BOAR.id,
    referencedEventType: EventType.Cast,
    referencedEventId: [
      TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id,
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
    ],
    anyTarget: true,
    anySource: false,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
    maximumLinks: 1,
  },
];

export default class HunterEventLinkNormalizers extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
  }
}
