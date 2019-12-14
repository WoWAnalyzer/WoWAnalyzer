import React from 'react';

import SPECS from 'game/SPECS';
import SPELLS from 'common/SPELLS';

import './ReportRaidBuffList.scss';

import ReportRaidBuffListItem from '../ReportRaidBuffListItem';

type Class = string; // TODO: enum
interface CombatantInfoEvent {
  timestamp: number;
  type: 'combatantinfo';
  pin: string;
  sourceID: number;
  gear: Array<{
    id: number;
    quality: number;
    icon: string;
    itemLevel: number;
    bonusIDs?: number[];
    permanentEnchant?: number;
    gems?: Array<{
      id: number;
      itemLevel: number;
      icon: string;
    }>;
  }>;
  auras: Array<{
    source: number;
    ability: number;
    stacks: number;
    icon: string;
    name?: string;
  }>;
  faction: number;
  specID: number;
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  dodge: number;
  parry: number;
  block: number;
  armor: number;
  critMelee: number;
  critRanged: number;
  critSpell: number;
  speed: number;
  leech: number;
  hasteMelee: number;
  hasteRanged: number;
  hasteSpell: number;
  avoidance: number;
  mastery: number;
  versatilityDamageDone: number;
  versatilityHealingDone: number;
  versatilityDamageReduction: number;
  talents: [
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
    { id: number; icon: string },
  ];
  pvpTalents: Array<{ id: number; icon: string }>;
  artifact: Array<{
    traitID: number;
    rank: number;
    spellID: number;
    icon: string;
    slot: number;
  }>;
  heartOfAzeroth: Array<{
    traitID: number;
    rank: number;
    spellID: number;
    icon: string;
    slot: number;
    isMajor: boolean;
  }>;
}

interface Props {
  combatants: CombatantInfoEvent[];
}
interface State {
  [key: string]: {
    spellId: number;
    count: number;
  };
}

class ReportRaidBuffList extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      stamina: {
        spellId: SPELLS.POWER_WORD_FORTITUDE.id,
        count: 0,
      },
      attackPower: {
        spellId: SPELLS.BATTLE_SHOUT.id,
        count: 0,
      },
      intellect: {
        spellId: SPELLS.ARCANE_INTELLECT.id,
        count: 0,
      },
      magicVulnerability: {
        spellId: SPELLS.CHAOS_BRAND.id,
        count: 0,
      },
      physicalVulnerability: {
        spellId: SPELLS.MYSTIC_TOUCH.id,
        count: 0,
      },
      bloodlust: {
        spellId: SPELLS.BLOODLUST.id,
        count: 0,
      },
      battleRes: {
        spellId: SPELLS.REBIRTH.id,
        count: 0,
      },
      rallyingCry: {
        spellId: SPELLS.RALLYING_CRY.id,
        count: 0,
      },
      darkness: {
        spellId: SPELLS.DARKNESS.id,
        count: 0,
      },
      auraMastery: {
        spellId: SPELLS.AURA_MASTERY.id,
        count: 0,
      },
      spiritLink: {
        spellId: SPELLS.SPIRIT_LINK_TOTEM.id,
        count: 0,
      },
      healingTide: {
        spellId: SPELLS.HEALING_TIDE_TOTEM_CAST.id,
        count: 0,
      },
      revival: {
        spellId: SPELLS.REVIVAL.id,
        count: 0,
      },
      barrier: {
        spellId: SPELLS.POWER_WORD_BARRIER_CAST.id,
        count: 0,
      },
      divineHymn: {
        spellId: SPELLS.DIVINE_HYMN_CAST.id,
        count: 0,
      },
      salvation: {
        spellId: SPELLS.HOLY_WORD_SALVATION_TALENT.id,
        count: 0,
      },
      tranquility: {
        spellId: SPELLS.TRANQUILITY_CAST.id,
        count: 0,
      },
    };
  }

  componentWillMount() {
    this.calculateCompositionBreakdown(this.props.combatants);
  }

  incrementBuff(buff: string) {
    this.setState(prevState => ({
      [buff]: { ...this.state[buff], count: prevState[buff].count + 1 },
    }));
  }

  calculateCompositionBreakdown(combatants: CombatantInfoEvent[]) {
    combatants.forEach(combatant => {
      this.calculateRaidBuffs(combatant);
      this.calculateHealingCds(combatant);
    });
  }

  calculateRaidBuffs(combatant: CombatantInfoEvent) {
    const spec = SPECS[combatant.specID];
    const className = spec.className;
    if (className === 'Priest') {
      this.incrementBuff('stamina');
    }

    if (className === 'Warrior') {
      this.incrementBuff('attackPower');
      this.incrementBuff('rallyingCry');
    }

    if (className === 'Mage') {
      this.incrementBuff('intellect');
    }

    if (className === 'DemonHunter') {
      this.incrementBuff('magicVulnerability');
      if (combatant.specID === SPECS.HAVOC_DEMON_HUNTER.id) {
        this.incrementBuff('darkness');
      }
    }

    if (className === 'Monk') {
      this.incrementBuff('physicalVulnerability');
    }

    if (className === 'Shaman' || className === 'Mage') {
      // TODO: Make faction specific
      this.incrementBuff('bloodlust');
    }

    if (
      className === 'Druid' ||
      className === 'DeathKnight' ||
      className === 'Warlock'
    ) {
      this.incrementBuff('battleRes');
    }
  }

  calculateHealingCds(combatant: CombatantInfoEvent) {
    if (combatant.specID === SPECS.HOLY_PALADIN.id) {
      this.incrementBuff('auraMastery');
    }

    if (combatant.specID === SPECS.RESTORATION_SHAMAN.id) {
      this.incrementBuff('spiritLink');
      this.incrementBuff('healingTide');
    }

    if (combatant.specID === SPECS.MISTWEAVER_MONK.id) {
      this.incrementBuff('revival');
    }

    if (combatant.specID === SPECS.DISCIPLINE_PRIEST.id) {
      this.incrementBuff('barrier');
    }

    if (combatant.specID === SPECS.HOLY_PRIEST.id) {
      this.incrementBuff('divineHymn');
      this.incrementBuff('salvation');
    }

    if (combatant.specID === SPECS.RESTORATION_DRUID.id) {
      this.incrementBuff('tranquility');
    }
  }

  render() {
    return (
      <div className="raidbuffs">
        <h1>Raid Buffs</h1>
        {Object.keys(this.state).map(key => (
          <ReportRaidBuffListItem
            key={key}
            spellId={this.state[key].spellId}
            count={this.state[key].count}
          />
        ))}
      </div>
    );
  }
}

export default ReportRaidBuffList;
