import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import * as contributors from 'CONTRIBUTORS';

import SPECS from 'common/SPECS';

import CoreChangelog from 'CHANGELOG';

import BloodDKChangelog from 'Parser/DeathKnight/Blood/CHANGELOG';
import UnholyDKChangelog from 'Parser/DeathKnight/Unholy/CHANGELOG';
import FrostDKChangelog from 'Parser/DeathKnight/Frost/CHANGELOG';

import HavocDHChangelog from 'Parser/DemonHunter/Havoc/CHANGELOG';
import VengeanceDHChangelog from 'Parser/DemonHunter/Vengeance/CHANGELOG';

import BlanceDChangelog from 'Parser/Druid/Balance/CHANGELOG';
import FeralDChangelog from 'Parser/Druid/Feral/CHANGELOG';
import GuardianDChangelog from 'Parser/Druid/Guardian/CHANGELOG';
import RestorationDChangelog from 'Parser/Druid/Restoration/CHANGELOG';

import BeastmasteryHChangelog from 'Parser/Hunter/BeastMastery/CHANGELOG';
import MarksmanshipHChangelog from 'Parser/Hunter/Marksmanship/CHANGELOG';
import SurvivalHChangelog from 'Parser/Hunter/Survival/CHANGELOG';

import ArcaneMChangelog from 'Parser/Mage/Arcane/CHANGELOG';
import FireMChangelog from 'Parser/Mage/Fire/CHANGELOG';
import FrostChangelog from 'Parser/Mage/Frost/CHANGELOG';

import BrewmasterMChangelog from 'Parser/Monk/Brewmaster/CHANGELOG';
import MistweaverMChangelog from 'Parser/Monk/Mistweaver/CHANGELOG';
import WindwalkerMChangelog from 'Parser/Monk/Windwalker/CHANGELOG';

import HolyPalChangelog from 'Parser/Paladin/Holy/CHANGELOG';
import ProtectionPalChangelog from 'Parser/Paladin/Protection/CHANGELOG';
import RetributionPalChangelog from 'Parser/Paladin/Retribution/CHANGELOG';

import DisciplinePChangelog from 'Parser/Priest/Discipline/CHANGELOG';
import HolyPChangelog from 'Parser/Priest/Holy/CHANGELOG';
import ShadowPChangelog from 'Parser/Priest/Shadow/CHANGELOG';

import AssassinationRChangelog from 'Parser/Rogue/Assassination/CHANGELOG';
import OutlawRChangelog from 'Parser/Rogue/Outlaw/CHANGELOG';
import SubtletyRChangelog from 'Parser/Rogue/Subtlety/CHANGELOG';

import ElementalSChangelog from 'Parser/Shaman/Elemental/CHANGELOG';
import EnhancementSChangelog from 'Parser/Shaman/Enhancement/CHANGELOG';
import RestorationSChangelog from 'Parser/Shaman/Restoration/CHANGELOG';

import AfflictionWChangelog from 'Parser/Warlock/Affliction/CHANGELOG';
import DemonologyWChangelog from 'Parser/Warlock/Demonology/CHANGELOG';
import DestructionWChangelog from 'Parser/Warlock/Destruction/CHANGELOG';

import ArmsWChangelog from 'Parser/Warrior/Arms/CHANGELOG';
import FuryWChangelog from 'Parser/Warrior/Fury/CHANGELOG';
import ProtectionWChangelog from 'Parser/Warrior/Protection/CHANGELOG';

class ContributorDetails extends React.PureComponent {

  static propTypes = {
    contributorId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
    this.filterChangelog = this.filterChangelog.bind(this);
  }

  removeWhiteSpaces(string) {
    return string.replace(" ", "");
  }

  iconPath(spec) {
    return `/specs/${this.removeWhiteSpaces(spec.className)}-${this.removeWhiteSpaces(spec.specName)}.jpg`;
  }

  char(char) {
    return (
      <div>
        <a href={char.link} target="_blank" className={this.removeWhiteSpaces(char.spec.className)}>
          <img style={{ height: '1.5em', width: '1.5em', marginRight: 10 }} src={this.iconPath(char.spec)} alt="spec icon" />
          {char.name}
        </a><br/>
      </div>
    );
  }

  filterChangelog(contribution) {
    return contribution.contributors.includes(contributors[this.props.contributorId]);
  }

  toggleClass(index) {
    const stateList = this.state.list;
    stateList[index] = !stateList[index];
    this.setState({ list: stateList });
    this.forceUpdate();
  }

  contributionHeader(spec) {
    if (spec === 'Core') {
      return <span>
        <img src="/favicon.png" style={{ height: '2em', width: '2em', marginRight: 10 }} alt="Icon" />
        Core
      </span>;
    } else {
      return <span>
        <img src={this.iconPath(SPECS[spec])} style={{ height: '2em', width: '2em', marginRight: 10 }} alt="Icon" />
        {SPECS[spec].specName} {SPECS[spec].className}
      </span>;
    }
  }

  links(object) {
    if (object === undefined) {
      return;
    } else {
      const value = [];
      Object.keys(object).forEach((key) => {
        value.push(<div>
          <a href={object[key]} target="_blank">{key}</a>
        </div>);
      });
      return (
        <div className="row" style={{ marginBottom: 30 }}>
          <div class="col-md-3"><b>Links:</b></div>
            <div class="col-md-9">
              {value}
            </div>
        </div>
      );
    }
  }

  additionalInfo(object) {
    if (object === undefined) {
      return;
    }

    const value = [];
    Object.keys(object).forEach((key) => {
      if (Array.isArray(object[key]) === true) {
        const subvalue = [];
        object[key].forEach((elem) => {
          subvalue.push(<div>{elem}</div>);
        });

        value.push(<div className="row">
          <div class="col-md-3"><b>{key}:</b></div>
            <div class="col-md-9">
              {subvalue}
            </div>
        </div>);

      } else if (typeof object[key] === "string") {
        value.push(<div className="row">
          <div class="col-md-3"><b>{key}:</b></div>
            <div class="col-md-9">
              {object[key]}
            </div>
        </div>);
      }
    });
    return value;
  }

  maintainer(contributor) {
    if (contributor.maintainer === undefined) {
      return;
    } else {
      return <div class="row">
        <div class="col-md-3"><b>Maintainer:</b></div>
        <div class="col-md-9">
          {contributor.maintainer.map((char, index) =>
            <div className={this.removeWhiteSpaces(char.className)}>
              <img style={{ height: '1.5em', width: '1.5em', marginRight: 10 }} src={this.iconPath(char)} alt={"Spec Icon"} />
              {char.specName} {char.className}
            </div>
          )}
        </div>
      </div>;
    }
  }

  chars(contributor, typ) {
    if (contributor[typ] === undefined) {
      return;
    } else {
      const stlye = typ === 'mains' ? { marginTop: 30 } : { marginBottom: 30 };
      return <div class="row" style={stlye}>
        <div class="col-md-3"><b>{typ[0].toUpperCase() + typ.slice(1)}:</b></div>
        <div class="col-md-9">
          {contributor[typ].map((char, index) => this.char(char) )}
        </div>
      </div>; 
    }
  }

  about(contributor) {
    if (contributor.desc === undefined) {
      return;
    } else {
      return <div class="row">
        <div class="col-md-3"><b>About me:</b></div>
        <div class="col-md-9">
          {contributor.desc}
        </div>
      </div>;
    }
  }

  render() {
    const { contributorId } = this.props;
    const contributor = contributors[contributorId];
    const contributions = {
      'Core': CoreChangelog,
      BLOOD_DEATH_KNIGHT: BloodDKChangelog,
      UNHOLY_DEATH_KNIGHT: UnholyDKChangelog,
      FROST_DEATH_KNIGHT: FrostDKChangelog,

      HAVOC_DEMON_HUNTER: HavocDHChangelog,
      VENGEANCE_DEMON_HUNTER: VengeanceDHChangelog,

      BALANCE_DRUID: BlanceDChangelog,
      FERAL_DRUID: FeralDChangelog,
      GUARDIAN_DRUID: GuardianDChangelog,
      RESTORATION_DRUID: RestorationDChangelog,

      BEAST_MASTERY_HUNTER: BeastmasteryHChangelog,
      MARKSMANSHIP_HUNTER: MarksmanshipHChangelog,
      SURVIVAL_HUNTER: SurvivalHChangelog,

      ARCANE_MAGE: ArcaneMChangelog,
      FIRE_MAGE: FireMChangelog,
      FROST_MAGE: FrostChangelog,
      
      BREWMASTER_MONK: BrewmasterMChangelog,
      MISTWEAVER_MONK: MistweaverMChangelog,
      WINDWALKER_MONK: WindwalkerMChangelog,

      HOLY_PALADIN: HolyPalChangelog,
      PROTECTION_PALADIN: ProtectionPalChangelog,
      RETRIBUTION_PALADIN: RetributionPalChangelog,

      DISCIPLINE_PRIEST: DisciplinePChangelog,
      HOLY_PRIEST: HolyPChangelog,
      SHADOW_PRIEST: ShadowPChangelog,
      
      ASSASSINATION_ROGUE: AssassinationRChangelog,
      OUTLAW_ROGUE: OutlawRChangelog,
      SUBTLETY_ROGUE: SubtletyRChangelog,
      
      ELEMENTAL_SHAMAN: ElementalSChangelog,
      ENHANCEMENT_SHAMAN: EnhancementSChangelog,
      RESTORATION_SHAMAN: RestorationSChangelog,
      
      AFFLICTION_WARLOCK: AfflictionWChangelog,
      DEMONOLOGY_WARLOCK: DemonologyWChangelog,
      DESTRUCTION_WARLOCK: DestructionWChangelog,
      
      ARMS_WARRIOR: ArmsWChangelog,
      FURY_WARRIOR: FuryWChangelog,
      PROTECTION_WARRIOR: ProtectionWChangelog,
    };

    if (contributor.avatar === undefined) {
      contributor.avatar = "/favicon.png";
    }

    Object.keys(contributions).forEach((key) => {
      contributions[key] = contributions[key].filter(this.filterChangelog);
      if (contributions[key].length === 0) {
        delete contributions[key];
      }
    });

    return(
      <div className="container">
        <Link to="/">
          Home
        </Link> &gt;{' '}
        {contributor.nickname} <br/><br/>

        <div className="flex-main">
          <div className="row">
            <div className="col-md-5">
              <div className="panel">
                <div style={{ textAlign: 'center' }}>
                  <h2>{contributor.nickname}</h2>
                  <img src={contributor.avatar} alt={'Avatar'} style={{ marginTop: 20, maxHeight: 200, borderRadius: '50%' }}/>
                </div>
                <div class="flex-main contributorlist" style={{ padding: 30 }}>
                  {this.about(contributor)}
                  <div class="row">
                    <div class="col-md-3"><b>GitHub:</b></div>
                    <div class="col-md-9">
                      <a href={"https://github.com/" + contributor.github} target="_blank">{contributor.github}</a>
                    </div>
                  </div>
                  {this.maintainer(contributor)}
                  {this.links(contributor.links)}
                  {this.additionalInfo(contributor.others)}
                  {this.chars(contributor, "mains")}
                  {this.chars(contributor, "alts")}
                </div>
              </div>
            </div>


            <div className="col-md-7">
              <div class="panel">
                {Object.keys(contributions).map((type, index) => 
                  <div key={index}>
                    <div className="panel-heading" style={{ cursor: 'pointer' }} onClick={() => this.toggleClass(index)}>
                      <h2>{this.contributionHeader(type)} ({contributions[type].length} commits)</h2>
                    </div>
                    <ul className="list text" style={{ marginBottom: 30, display: this.state.list[index] === true ? 'block' : 'none' }}>
                      {contributions[type].map((contribution) => 
                        <li className="row">
                          <div className="col-md-2">
                            {contribution.date.toLocaleDateString()}
                          </div>
                          <div className="col-md-10">
                            {contribution.changes}
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContributorDetails;