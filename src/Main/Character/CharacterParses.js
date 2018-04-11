import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import fetchWcl from 'common/fetchWcl';

import SPECS from 'common/SPECS';
import DIFFICULTIES from 'common/DIFFICULTIES';
import ITEMS from 'common/ITEMS';

import { formatNumber, formatPercentage } from 'common/format';
import { makePlainUrl } from 'Main/makeAnalyzerUrl';

import SpellIcon from 'common/SpellIcon';
import ItemLink from 'common/ItemLink';
import Icon from 'common/Icon';
import ZONES from 'common/ZONES';

import ActivityIndicator from 'Main/ActivityIndicator';

/*
  ToDo: 
    - fix the issue with Special-Chars (Ê and stuff)

    - caching of bnet-api for images

    - submit a proper playerID for the analyze-link
    
    - get a fix for renamed/transed chars 
        (char-name does not match in this case, impossible to jump directly to the correct player of the log, redirect to player-overview instead)
        Asked on discord for fix:
        `yeah probably should
        right now it puts the current character's name
        should get fixed as i optimize character ranks on beta anyway`
*/

//rendering 400+ parses takes quite some time
const RENDER_LIMIT = 100;

class CharacterParses extends React.Component {

  static propTypes = {
    region: PropTypes.string.isRequired,
    realm: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      specs: [],
      class: "",
      activeSpec: [],
      activeDifficulty: [],
      activeZoneID: 17,
      activeEncounter: 0,
      sortBy: 0,
      metric: 'dps',
      image: '',
      parses: [],
      isLoading: true,
      error: false,
    };

    this.updateDifficulty = this.updateDifficulty.bind(this);
    this.updateSpec = this.updateSpec.bind(this);

    this.load = this.load.bind(this);
    this.changeParseStructure = this.changeParseStructure.bind(this);
    this.iconPath = this.iconPath.bind(this);
    this.fetchImage = this.fetchImage.bind(this);
    this.fillMissingTrinkets = this.fillMissingTrinkets.bind(this);
  }

  componentDidMount() {
    this.fetchImage();
    this.load();
  }

  iconPath(specName) {
    return `/specs/${this.state.class.replace(" ", "")}-${specName.replace(" ", "")}.jpg`;
  }

  updateDifficulty(diff) {
    let newDiff = this.state.activeDifficulty;
    if (newDiff.includes(diff)) {
      newDiff = newDiff.filter((elem, index) => {
        return elem !== diff;
      });
    } else {
      newDiff.push(diff);
    }

    this.setState({
      activeDifficulty: newDiff,
    });
  }

  updateSpec(spec) {
    let newSpec = this.state.activeSpec;
    if (newSpec.includes(spec)) {
      newSpec = newSpec.filter((elem, index) => {
        return elem !== spec;
      });
    } else {
      newSpec.push(spec);
    }

    this.setState({
      activeSpec: newSpec,
    });
  }

  fillMissingTrinkets() {
    Object.values(ITEMS).forEach(trinket => {
      if (trinket.icon === ITEMS[0].icon && trinket.id !== 0) {
        return fetch(`https://eu.api.battle.net/wow/item/${trinket.id}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
          .then(response => response.json())
          .then((data) => {
            ITEMS[trinket.id].icon = data.icon;
            this.forceUpdate();
          });
      }
    });
  }

  get filterParses() {
    let filteredParses = this.state.parses;
    filteredParses = filteredParses
      .filter((elem, index) => { return this.state.activeDifficulty.includes(elem.difficulty); })
      .filter((elem, index) => { return this.state.activeSpec.includes(elem.spec); })
      .sort((a, b) => { 
        if (this.state.sortBy === 0) {
          return b.start_time - a.start_time; 
        } else if (this.state.sortBy === 1) {
          return b.persecondamount - a.persecondamount;
        }
        return b.historical_percent - a.historical_percent;
      });

    if (Number(this.state.activeEncounter) === 0) {
      return filteredParses.slice(0, RENDER_LIMIT);
    }

    filteredParses = filteredParses.filter((elem, index) => {
      return elem.name === this.state.activeEncounter;
    });

    return filteredParses.slice(0, RENDER_LIMIT);
  }

  rankingColor(rank) {
    rank = Math.floor(rank);
    switch (true) {
      case (rank < 25):
        return 'grey';
      case (rank < 50):
        return 'green';
      case (rank < 70):
        return 'blue';
      case (rank < 90):
        return 'purple';
      case (rank <= 99):
        return 'orange';
      case (rank === 100):
        return 'artifact';
      default:
        return 'none';
    }
  }

  //resolve the boss+difficulty->spec->parse structure to make sorting & filtering easiery
  changeParseStructure(rawParses) {
    const parses = [];
    rawParses.forEach((elem, index) => {
      const name = elem.name;
      const difficulty = DIFFICULTIES[elem.difficulty];

      elem.specs
        .filter((item) => { return item.spec !== "Melee" && item.spec !== "Ranged"; })
        .forEach(element => {
          const spec = element.spec;
          element.data.forEach(singleParse => {
            const finalParse = Object.assign({
              name: name,
              spec: spec,
              difficulty: difficulty,
            }, singleParse);

            //filter all logs that have missing talents (logs that were logged without advanced logging)
            if (Object.values(singleParse.talents).filter((talent) => { return talent.id === 0; }).length === 0) {
              parses.push(finalParse);
            }

            //get missing trinket-icons later
            if (!ITEMS[singleParse.gear[12].id]) {
              ITEMS[singleParse.gear[12].id] = {
                name: singleParse.gear[12].name,
                id: singleParse.gear[12].id,
                icon: ITEMS[0].icon,
                quality: singleParse.gear[13].quality,
              };
            }

            if (!ITEMS[singleParse.gear[13].id]) {
              ITEMS[singleParse.gear[13].id] = {
                name: singleParse.gear[13].name,
                id: singleParse.gear[13].id,
                icon: ITEMS[0].icon,
                quality: singleParse.gear[13].quality,
              };
            }
          });
      });
    });

    this.fillMissingTrinkets();

    return parses;

  }

  get zoneBosses() {
    const zones = ZONES.filter(zone => zone.id === this.state.activeZoneID ).map(e => {
      return e.encounters;
    })[0];
    return zones;
  }

  fetchImage() {
    //save the chars image URL to localstore
    const image = localStorage.getItem(`${this.props.region}/${this.props.realm}/${this.props.name}`);
    if (image) {
      this.setState({
        image: image,
      });
      return;
    }
    return fetch(`https://${this.props.region}.api.battle.net/wow/character/${encodeURIComponent(this.props.realm)}/${encodeURIComponent(this.props.name)}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
      .then(response => response.json())
      .then((data) => {
        const image = data.thumbnail.replace('-avatar.jpg', '');
        localStorage.setItem(`${this.props.region}/${this.props.realm}/${this.props.name}`, image);
        this.setState({
          image: image,
        });
      });
  }

  load(refresh = false) {
    return fetchWcl(`parses/character/${ encodeURIComponent(this.props.name) }/${ encodeURIComponent(this.props.realm) }/${ this.props.region }`, {
      metric: this.state.metric,
      zone: this.state.activeZoneID,
      _: refresh ? +new Date() : undefined,
    }).then((rawParses) => {
      if (rawParses.status === 400) {
        // means char was not found on WCL
        this.setState({
          error: true,
        });
        return;
      }
      if (this.state.class !== "") { //only update parses when class was already parsed (since its only a metric/raid change)
        const parses = this.changeParseStructure(rawParses);
        this.setState({
          parses: parses,
          isLoading: false,
        });

        return;
      }

      const charClass = rawParses[0].specs[0].class;
      const specs = Object.values(SPECS)
        .map((elem, index) => { if (elem.className.replace(" ", "") !== charClass) { return undefined; } return elem.specName; })
        .filter((elem, index) => { return elem; });

      const parses = this.changeParseStructure(rawParses);
      this.setState({
        specs: [...new Set(specs)],
        activeSpec: [...new Set(specs.map(elem => { return elem.replace(" ", ""); }))],
        activeDifficulty: DIFFICULTIES.filter(elem => { return elem; }),
        class: charClass,
        parses: parses,
        isLoading: false,
      });
    });
  }

  render() {
    return (
      <div className="container charparse">
        <div className="flex-main">
          <div className="row">
            <div className="col-md-7">
              {this.state.error && (
                <span>
                  <Link to="/">
                    Home
                  </Link> &gt;{' '}
                  <span>
                    {this.props.region} - {this.props.realm} - {this.props.name}
                  </span>
                  <br /><br />
                </span>
              )}
              <div className="panel" stlye={{ overflow: 'auto' }}>
                <div className="flex-main">
                  {this.state.isLoading && !this.state.error && (
                    <div style={{ textAlign: 'center', fontSize: '2em', margin: '20px 0' }}>
                      <ActivityIndicator text="Fetching logs..." />
                    </div>
                  )}
                  {this.state.error && (
                    <div>
                      <div class="panel-heading">
                        <h2>We couldn't find your character on Warcraft Logs.</h2>
                      </div>
                      <div style={{ padding: 20 }}>
                        Please check your input and make sure that you've selected the correct region and realm.<br/>
                        If your input was correct, then make sure that someone in your raid logged the fight for you or check <a href="https://www.warcraftlogs.com/help/start/" target="_blank" rel="noopener noreferrer">Warcraft Logs guide</a> to get started with logging on your own.<br/><br/>
                        When you know for sure that you have logs on Warcraft Logs and you still get this error, please message us on <a href="https://discord.gg/AxphPxU" target="_blank" rel="noopener noreferrer">Discord</a> or create an issue on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer" target="_blank" rel="noopener noreferrer">Github</a>.
                      </div>
                    </div>
                  )}
                  {this.filterParses.length === 0 && !this.state.isLoading && !this.state.error && (
                    <div style={{ padding: 20 }}>
                      We couldn't find any logs.<br/>
                      Please check your filters and make sure that you logged those fights on Warcraft Logs.<br/><br/>
                      You don't know how to log your fights? Check <a href="https://www.warcraftlogs.com/help/start/" target="_blank" rel="noopener noreferrer">Warcraft Logs guide</a> to get startet.
                    </div>
                  )}
                  {!this.state.isLoading && this.filterParses.map((elem, index) =>
                    <div className="row character-parse">
                      <div className="col-md-5">
                        <img src={this.iconPath(elem.spec)} style={{ height: 30, marginRight: 10 }} alt="Icon" />
                        {elem.difficulty} - {elem.name}
                      </div>
                      <div className="col-md-5">
                        {elem.talents.map(talent => 
                          <SpellIcon 
                            id={talent.id}
                            style={{ width: '1.8em', height: '1.8em', marginRight: 2, marginBottom: 10 }}
                          />
                        )}
                      </div>
                      <div className="col-md-2" style={{ textAlign: 'right' }}>
                        {new Date(elem.start_time).toLocaleDateString()}
                      </div>
                      
                      <div className="col-md-5" style={{ paddingLeft: 55 }}>
                        <span className={'parse-' + this.rankingColor(elem.historical_percent)}>
                          {formatNumber(elem.persecondamount)} {this.state.metric.toLocaleUpperCase()} ({formatPercentage(elem.historical_percent / 100)}%)
                        </span>
                      </div>
                      <div className="col-md-5">
                        {elem.gear.filter((item, index) => { return index === 12 || index === 13 || item.quality === "legendary"; }).map(item =>
                          <ItemLink id={item.id} className={item.quality} icon={false} >
                            <Icon 
                              icon={ITEMS[item.id] ? ITEMS[item.id].icon : ITEMS[0].icon} 
                              style={{ width: '1.8em', height: '1.8em', border: '1px solid', marginRight: 2 }}
                            />
                          </ItemLink>
                        )}
                      </div>
                      <div className="col-md-2" style={{ textAlign: 'right' }}>
                        <a href={makePlainUrl(elem.report_code, elem.report_fight, elem.difficulty + " " + elem.name, "+", elem.character_name)} target="_blank">
                          analyze
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="panel">
                <div className="flex-main">
                  <div className="row filter">
                    <div className="col-md-12" style={{ marginBottom: 20, position: 'relative', height: 280 }}>
                      {this.state.image && (
                        <div className="char-image">
                          <img 
                            src={`https://render-${this.props.region}.worldofwarcraft.com/character/${this.state.image}-main.jpg`}
                            alt={"Pic"} 
                            onError={e => this.setState({ image: false })}
                            style={{ width: '100%' }} />
                        </div>
                      )}
                      <h2 style={{ fontSize: '1.8em' }}>{this.props.region} - {this.props.realm}</h2>
                      <h2 style={{ fontSize: '2.4em', marginLeft: 20 }}>
                        {this.state.class && (
                          <img
                            src={`/specs/${this.state.class}-New.png`}
                            alt="Pic"
                            style={{ opacity: .8, height: 50, marginRight: 20 }}
                          />
                        )}
                        {this.props.name}
                      </h2>
                    </div>
                    <div className="col-md-4">
                      Raid:
                      <select className="form-control" onChange={e => this.setState({ activeZoneID: Number(e.target.value)}, () => { this.load().catch(e => { console.log('Error'); });})}>
                        {Object.values(ZONES).reverse().map(elem =>
                          <option value={elem.id}>{elem.name}</option>
                        )}
                      </select>
                      Boss:
                      <select className="form-control" value={this.state.activeEncounter} onChange={e => this.setState({ activeEncounter: e.target.value })}>
                        <option value={0} defaultValue>All bosses</option>
                        {this.zoneBosses.map(e => 
                          <option value={e.name}>{e.name}</option>
                        )}
                      </select>
                      Metric:
                      <select className="form-control" onChange={e => this.setState({ metric: e.target.value }, () => { this.load().catch(e => { console.log('Error'); });})}>
                        <option defaultValue value="dps">DPS</option>
                        <option value="hps">HPS</option>
                      </select>
                      Sort by:
                      <select className="form-control" onChange={e => this.setState({ sortBy: Number(e.target.value) })}>
                        <option defaultValue value={0}>Date</option>
                        <option value={1}>DPS / HPS</option>
                        <option value={2}>Percentile</option>
                      </select>
                    </div>
                    
                    <div className="col-md-4">
                      Difficulties:
                      {DIFFICULTIES.filter((elem) => { return elem; }).map((elem, index) => 
                        <div onClick={() => this.updateDifficulty(elem)} className={ this.state.activeDifficulty.includes(elem) ? 'selected form-control' : 'form-control'}>
                          {elem}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      Specs:
                      {this.state.specs.map((elem, index) => 
                        <div onClick={() => this.updateSpec(elem.replace(" ", ""))} className={this.state.activeSpec.includes(elem.replace(" ", "")) ? 'selected form-control' : 'form-control'}>
                          <img src={this.iconPath(elem)} style={{ height: 18, marginRight: 10 }} alt="Icon" />
                          {elem}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-muted" style={{ padding: 15, display: 'block' }}>
                  A few logs might take you to a log where we can't find the correct player and show the player-selection instead.
                  This only happens in the case of a realm transfer or character rename until the WCL-API is returning the correct name.<br/><br/>
                  Some logs are missing? We hide logs that were logged without 'advanced combatlog' since those are not detailed enough to be analyzed.
                </span>
                <div style={{ textAlign: 'right', padding: 10 }}>
                  <span className="pseudolink" onClick={() => this.load(true)}>
                    <span className="glyphicon glyphicon-refresh" aria-hidden="true" /> Refresh
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CharacterParses;
