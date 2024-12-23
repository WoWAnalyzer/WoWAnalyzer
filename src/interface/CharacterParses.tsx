import { i18n, MessageDescriptor } from '@lingui/core';
import { defineMessage, Trans } from '@lingui/macro';
import { captureException } from 'common/errorLogger';
import fetchWcl, { CharacterNotFoundError, UnknownApiError, WclApiError } from 'common/fetchWclApi';
import { makeCharacterApiUrl } from 'common/makeApiUrl';
import retryingPromise from 'common/retryingPromise';
import RETAIL_DIFFICULTIES, {
  CLASSIC_DIFFICULTIES,
  getLabel as getDifficultyLabel,
} from 'game/DIFFICULTIES';
import SPECS, { isRetailSpec } from 'game/SPECS';
import RETAIL_ZONES from 'game/ZONES';
import CLASSIC_ZONES from 'game/classic/ZONES';
import ActivityIndicator from 'interface/ActivityIndicator';
import ArmoryIcon from 'interface/icons/Armory';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';
import WipefestIcon from 'interface/icons/Wipefest';
import REPORT_HISTORY_TYPES from 'interface/REPORT_HISTORY_TYPES';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { isHiddenParsesResponse, WCLParse, WCLParsesResponse } from 'common/WCL_TYPES';
import { isSupportedRegion } from 'common/regions';

import './report/Results/Header.scss';
import './CharacterParses.scss';
import ParsesList, { Parse } from './CharacterParsesList';
import { appendReportHistory } from './reducers/reportHistory';
import { CLASS_NAMES } from 'game/CLASSES';
import {
  classBackgroundImage,
  characterBackgroundImage,
} from 'interface/report/Results/PlayerInfo';

const loadRealms = (classic: boolean) =>
  retryingPromise(() =>
    classic
      ? import('game/REALMS').then((exports) => exports.CLASSIC_REALMS)
      : import('game/REALMS').then((exports) => exports.REALMS),
  );

//rendering 400+ parses takes quite some time
const RENDER_LIMIT = 100;

const ORDER_BY = {
  DATE: 0,
  DPS: 1,
  PERCENTILE: 2,
};
const DEFAULT_RETAIL_ZONE = 38; // Nerub'ar Palace
const DEFAULT_CLASSIC_ZONE = 1023; // BWD / BoT / TotFW
const BOSS_DEFAULT_ALL_BOSSES = 0;
const FALLBACK_PICTURE = '/img/fallback-character.jpg';
const ERRORS = {
  CHARACTER_NOT_FOUND: defineMessage({
    id: 'interface.characterParses.characterParses.errors.characterNotFound',
    message: `We couldn't find your character on Warcraft Logs`,
  }),
  NO_PARSES_FOR_TIER: defineMessage({
    id: 'interface.characterParses.characterParses.errors.noParsesForTier',
    message: `We couldn't find any logs`,
  }),
  CHARACTER_HIDDEN: defineMessage({
    id: 'interface.characterParses.characterParses.errors.characterHidden',
    message: `We could find your character but he's very shy`,
  }),
  WCL_API_ERROR: defineMessage({
    id: 'interface.characterParses.characterParses.errors.wclAPIError',
    message: `Something went wrong talking to Warcraft Logs`,
  }),
  UNKNOWN_API_ERROR: defineMessage({
    id: 'interface.characterParses.characterParses.errors.unknownAPIError',
    message: `Something went wrong talking to the server`,
  }),
  UNEXPECTED: defineMessage({
    id: 'interface.characterParses.characterParses.errors.unexpected',
    message: `Something went wrong`,
  }),
  NOT_RESPONDING: defineMessage({
    id: 'interface.characterParses.characterParses.errors.notResponding',
    message: `Request timed out`,
  }),
};

interface CharacterParsesProps {
  region: string;
  realm: string;
  name: string;
  game?: 'classic' | 'retail' | string | null;
  appendReportHistory: typeof appendReportHistory;
}

interface Player {
  name: string;
  realm: string;
  region: string;
  class: string;
}

interface CharacterParsesState {
  specs: Array<{ en: string; translated: string }>;
  class: string;
  activeSpec: string[];
  activeDifficultyIds: number[];
  activeZoneID: number;
  activeEncounter: number;
  sortBy: number;
  metric: string;
  characterImage: string | null;
  classImage: string | null;
  avatarImage: string | null;
  parses: Parse[];
  isLoading: boolean;
  error: MessageDescriptor | null;
  errorMessage: string | null;
  realmSlug: string | null;
}

class CharacterParses extends Component<CharacterParsesProps, CharacterParsesState> {
  constructor(props: CharacterParsesProps) {
    super(props);
    this.state = {
      specs: [],
      class: '',
      activeSpec: [],
      activeDifficultyIds: Object.values(
        this.isClassic ? CLASSIC_DIFFICULTIES : RETAIL_DIFFICULTIES,
      ),
      activeZoneID: this.isClassic ? DEFAULT_CLASSIC_ZONE : DEFAULT_RETAIL_ZONE,
      activeEncounter: BOSS_DEFAULT_ALL_BOSSES,
      sortBy: ORDER_BY.DATE,
      metric: 'dps',
      characterImage: null,
      classImage: null,
      avatarImage: null,
      parses: [],
      isLoading: true,
      error: null,
      errorMessage: null,
      realmSlug: this.props.realm,
    };
  }

  get isClassic() {
    return this.props.game === 'classic';
  }

  get difficulties() {
    return this.isClassic ? CLASSIC_DIFFICULTIES : RETAIL_DIFFICULTIES;
  }

  async componentDidMount() {
    this.fetchBattleNetInfo();
  }

  iconPath(specName: string) {
    return `/specs/${this.state.class.replace(' ', '')}-${specName.replace(' ', '')}.jpg`;
  }

  appendHistory(player: Player) {
    this.props.appendReportHistory({
      code: `${player.name}-${player.realm}-${player.region}`,
      end: Date.now(),
      type: REPORT_HISTORY_TYPES.CHARACTER,
      playerName: player.name,
      playerRealm: player.realm,
      playerRegion: player.region,
      playerClass: player.class,
    });
  }

  updateZoneMetricBoss(zone: number, metric: string, boss: number) {
    this.setState(
      {
        activeZoneID: zone,
        metric: metric,
        activeEncounter: boss,
      },
      () => {
        this.load();
      },
    );
  }

  updateDifficulty(diff: number) {
    let newDiff = this.state.activeDifficultyIds;
    if (newDiff.includes(diff)) {
      newDiff = newDiff.filter((elem) => elem !== diff);
    } else {
      newDiff = [...newDiff, diff];
    }

    this.setState({
      activeDifficultyIds: newDiff,
    });
  }

  updateSpec(spec: string) {
    let newSpec = this.state.activeSpec;
    if (newSpec.includes(spec)) {
      newSpec = newSpec.filter((elem) => elem !== spec);
    } else {
      newSpec = [...newSpec, spec];
    }

    this.setState({
      activeSpec: newSpec,
    });
  }

  get filterParses() {
    let filteredParses = this.state.parses;
    filteredParses = filteredParses
      .filter((elem) => this.state.activeDifficultyIds.includes(elem.difficulty))
      .filter((elem) => this.state.activeSpec.includes(elem.spec))
      .sort((a, b) => {
        if (this.state.sortBy === ORDER_BY.DATE) {
          return b.start_time - a.start_time;
        } else if (this.state.sortBy === ORDER_BY.DPS) {
          return b.persecondamount - a.persecondamount;
        }
        return b.historical_percent - a.historical_percent;
      });

    if (Number(this.state.activeEncounter) === BOSS_DEFAULT_ALL_BOSSES) {
      return filteredParses.slice(0, RENDER_LIMIT);
    }

    filteredParses = filteredParses.filter(
      (elem) => elem.encounterId === this.state.activeEncounter,
    );

    return filteredParses.slice(0, RENDER_LIMIT);
  }

  changeParseStructure(rawParses: WCLParse[]) {
    const parses = rawParses.map<Parse>((elem) => ({
      encounterId: elem.encounterID,
      name: elem.encounterName,
      spec: elem.spec.replace(' ', ''),
      difficulty: elem.difficulty,
      size: elem.size,

      report_code: elem.reportID,

      report_fight: elem.fightID,

      historical_percent: 100 - (elem.rank / elem.outOf) * 100,
      persecondamount: elem.total,

      start_time: elem.startTime,

      character_name: elem.characterName,
      talents: elem.talents,
      gear: elem.gear,
      advanced: elem.talents
        ? Object.values(elem.talents).filter((talent) => talent.id === null).length === 0
        : false,
    }));

    return parses;
  }

  get zones() {
    return this.isClassic ? CLASSIC_ZONES : RETAIL_ZONES;
  }

  get zoneBosses() {
    return this.zones.find((zone) => zone.id === this.state.activeZoneID)?.encounters;
  }

  async fetchBattleNetInfo() {
    if (this.isClassic) {
      // Skip Blizzard API - Classic is not supported
      this.setState(
        {
          characterImage: FALLBACK_PICTURE,
        },
        () => {
          this.load();
        },
      );
      return;
    }

    const { region, realm, name } = this.props;

    // Skip CN-API due to blizzard restrictions (aka there is no API for CN)
    if (region === 'CN') {
      this.setState(
        {
          characterImage: FALLBACK_PICTURE,
        },
        () => {
          this.load();
        },
      );
      return;
    }
    // fetch character image and active spec from battle-net
    const response = await fetch(makeCharacterApiUrl(undefined, region, realm, name));
    if (response.status === 500) {
      this.setState({
        isLoading: false,
        error: ERRORS.NOT_RESPONDING,
      });
      return;
    } else if (response.status === 404) {
      this.setState({
        isLoading: false,
        error: ERRORS.CHARACTER_NOT_FOUND,
      });
      return;
    } else if (!response.ok) {
      this.setState({
        isLoading: false,
        error: ERRORS.UNEXPECTED,
      });
      return;
    }

    const data = await response.json();
    const classImageUrl = data?.class
      ? classBackgroundImage(CLASS_NAMES[data.class].name, data.region)
      : null;
    const avatarUrl = data.thumbnail
      ? data.thumbnail.startsWith('https')
        ? data.thumbnail
        : `https://render-${this.props.region}.worldofwarcraft.com/character/${data.thumbnail}`
      : undefined;
    const characterImageUrl = characterBackgroundImage(avatarUrl, data.region);
    const role = data.role;
    const metric = role === 'HEALING' ? 'hps' : 'dps';
    this.setState(
      {
        characterImage: characterImageUrl,
        classImage: classImageUrl,
        avatarImage: avatarUrl,
        metric: metric,
      },
      () => {
        this.load();
      },
    );
  }

  async findRealm() {
    if (!isSupportedRegion(this.props.region)) {
      console.warn(
        `Region is not supported: ${this.props.region}. This generally indicates a bug.`,
      );
      return null;
    }
    const realms = await loadRealms(this.isClassic);
    // Use the slug from REALMS when available, otherwise try realm-prop and fail
    // TODO: Can we make this return results more reliably?
    const realmsInRegion = realms[this.props.region];
    const lowerCaseRealm = this.props.realm.toLowerCase();
    const realm = realmsInRegion
      ? realmsInRegion.find((elem) => elem.name.toLowerCase() === lowerCaseRealm)
      : null;
    if (!realm) {
      console.warn(
        'Realm could not be found: ' + this.props.realm + '. This generally indicates a bug.',
      );
    }

    return realm;
  }

  async getRealmSlug() {
    const realm = await this.findRealm();
    return realm ? realm.slug : this.props.realm;
  }

  async load(refresh = false) {
    this.setState({
      isLoading: true,
    });

    const realm = await this.getRealmSlug();
    this.setState({
      realmSlug: realm,
    });

    const urlEncodedName = encodeURIComponent(this.props.name);
    const urlEncodedRealm = encodeURIComponent(realm);

    return fetchWcl<WCLParsesResponse>(
      `parses/character/${urlEncodedName}/${urlEncodedRealm}/${this.props.region}`,
      {
        game: this.isClassic ? 'classic' : undefined,
        includeCombatantInfo: true,
        metric: this.state.metric,
        zone: this.state.activeZoneID,
        timeframe: 'historical',
        partition: this.zones.find((z) => z.id === this.state.activeZoneID)?.partition ?? -1,
      },
      undefined,
      refresh,
    )
      .then((rawParses) => {
        if (isHiddenParsesResponse(rawParses)) {
          // WCL responds with {hidden:true} when the logs are hidden.
          this.setState({
            parses: [],
            isLoading: false,
            error: ERRORS.CHARACTER_HIDDEN,
          });
          return;
        }
        if (rawParses.length === 0) {
          this.setState({
            parses: [],
            isLoading: false,
            error: ERRORS.NO_PARSES_FOR_TIER,
          });
          return;
        }

        if (this.state.class !== '') {
          //only update parses when class was already parsed (since its only a metric/raid change)
          const parses = this.changeParseStructure(rawParses);
          this.setState({
            parses: parses,
            error: null,
            isLoading: false,
          });
          return;
        }

        const charClass = rawParses[0].class;
        const specs = Object.entries(SPECS)
          // SPECS is indexed both by name and id. only take the id-keyed entries
          .filter(([k]) => Number.isFinite(Number(k)))
          .map(([, v]) => v)
          .filter((e) => isRetailSpec(e) === !this.isClassic) // only take retail specs on retail, classic specs on classic
          .filter((e) => e.wclClassName === charClass);

        const parses = this.changeParseStructure(rawParses);

        this.appendHistory({
          name: this.props.name,
          realm: this.props.realm,
          region: this.props.region,
          class: charClass,
        });

        this.setState({
          specs: specs.map((elem) => {
            return {
              en: elem.wclSpecName,
              translated: elem.specName ? i18n._(elem.specName) : elem.wclSpecName,
            };
          }),
          activeSpec: specs.map((elem) => elem.wclSpecName.replace(' ', '')),
          class: charClass,
          parses: parses,
          isLoading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (err instanceof CharacterNotFoundError) {
          this.setState({
            error: ERRORS.CHARACTER_NOT_FOUND,
            isLoading: false,
          });
          return;
        }
        captureException(err);
        if (err instanceof WclApiError) {
          this.setState({
            error: ERRORS.WCL_API_ERROR,
            errorMessage: err.message,
            isLoading: false,
          });
        } else if (err instanceof UnknownApiError) {
          this.setState({
            error: ERRORS.UNKNOWN_API_ERROR,
            errorMessage: err.message,
            isLoading: false,
          });
        } else {
          this.setState({
            error: ERRORS.UNEXPECTED,
            errorMessage: err.message,
            isLoading: false,
          });
        }
      });
  }

  get wclDomain() {
    return this.isClassic ? 'https://classic.warcraftlogs.com' : 'https://www.warcraftlogs.com';
  }

  formattedCharacterLink() {
    return `${this.wclDomain}/character/${this.props.region}/${this.state.realmSlug}/${this.props.name}`;
  }

  render() {
    let errorMessage;
    if (this.state.error === ERRORS.CHARACTER_NOT_FOUND) {
      errorMessage = (
        <Trans id="interface.characterParses.characterParses.errors.characterNotFoundDetails">
          Please check your input and make sure that you've selected the correct region and realm.
          <br />
          If your input was correct, then make sure that someone in your raid logged the fight for
          you or check{' '}
          <a
            href="https://www.warcraftlogs.com/help/start/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Warcraft Logs guide
          </a>{' '}
          to get started with logging on your own.
          <br />
          <br />
          When you know for sure that you have logs on Warcraft Logs and you still get this error,
          please message us on{' '}
          <a href="https://discord.gg/AxphPxU" target="_blank" rel="noopener noreferrer">
            Discord
          </a>{' '}
          or create an issue on{' '}
          <a
            href="https://github.com/WoWAnalyzer/WoWAnalyzer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
          .
        </Trans>
      );
    } else if (this.state.error === ERRORS.NOT_RESPONDING) {
      errorMessage = (
        <Trans id="interface.characterParses.characterParses.errors.notRespondingDetails">
          It looks like we couldn't get a response in time from the API, this usually happens when
          the servers are under heavy load.
          <br />
          <br />
          You could try and enter your report-code manually <Link to="/">here</Link>.<br />
          That would bypass the load-intensive character lookup and we should be able to analyze
          your report.
          <br />
        </Trans>
      );
    } else if (this.state.error === ERRORS.CHARACTER_HIDDEN) {
      errorMessage = (
        <Trans id="interface.characterParses.characterParses.errors.characterHiddenDetails">
          This character is hidden on warcraftlogs and we can't access the parses.
          <br />
          <br />
          You don't know how to make your character visible again? Check{' '}
          <a
            href="https://www.warcraftlogs.com/help/hidingcharacters/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Warcraft Logs{' '}
          </a>{' '}
          and hit the 'Refresh' button above once you're done.
        </Trans>
      );
    } else if (
      this.state.error === ERRORS.WCL_API_ERROR ||
      this.state.error === ERRORS.UNKNOWN_API_ERROR ||
      this.state.error === ERRORS.UNEXPECTED
    ) {
      errorMessage = (
        <Trans id="interface.characterParses.characterParses.errors.details">
          {this.state.errorMessage} Please message us on{' '}
          <a href="https://discord.gg/AxphPxU" target="_blank" rel="noopener noreferrer">
            Discord
          </a>{' '}
          or create an issue on{' '}
          <a
            href="https://github.com/WoWAnalyzer/WoWAnalyzer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>{' '}
          if this issue persists and we will fix it, eventually.
        </Trans>
      );
    } else if (this.state.error === ERRORS.NO_PARSES_FOR_TIER || this.filterParses.length === 0) {
      errorMessage = (
        <Trans id="interface.characterParses.characterParses.errors.noParsesForTierDetails">
          Please check your filters and make sure that you logged those fights on Warcraft Logs.
          <br />
          <br />
          Don't know how to log your fights? Check{' '}
          <a href={`${this.wclDomain}/help/start/`} target="_blank" rel="noopener noreferrer">
            Warcraft Logs guide
          </a>{' '}
          to get started.
        </Trans>
      );
    }

    let battleNetUrl: string | undefined =
      `https://worldofwarcraft.com/en-${this.props.region}/character/${this.state.realmSlug}/${this.props.name}`;
    if (this.isClassic) {
      battleNetUrl = undefined;
    } else if (this.props.region === 'CN') {
      battleNetUrl = `https://www.wowchina.com/zh-cn/character/${this.state.realmSlug}/${this.props.name}`;
    }

    return (
      <div className="results">
        <header>
          <div
            className="background"
            style={{
              backgroundImage: `url(${this.state.classImage})`,
            }}
          >
            <div
              className="img"
              style={{
                backgroundImage: `url(${this.state.characterImage})`,
                backgroundPosition: 'center center',
              }}
            />
          </div>
          <div className="info container">
            <div className="boss">
              <a
                href={this.formattedCharacterLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 22 }}
              >
                <WarcraftLogsIcon /> Warcraft Logs
              </a>
              <br />
              {battleNetUrl && (
                <>
                  <a
                    href={battleNetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ fontSize: 22 }}
                  >
                    <ArmoryIcon style={{ marginRight: '0.3em' }} />
                    <Trans id="interface.armory.text">Armory</Trans>
                  </a>
                  <br />
                </>
              )}
              {this.props.region !== 'CN' && (
                <a
                  href={`https://www.wipefest.gg/character/${this.props.name}/${
                    this.state.realmSlug
                  }/${this.props.region}?gameVersion=${
                    this.isClassic ? 'warcraft-classic' : 'warcraft-live'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ fontSize: 22 }}
                >
                  <WipefestIcon /> Wipefest
                </a>
              )}
            </div>
            <div className="player">
              <div className="avatar">
                {this.state.avatarImage && <img src={this.state.avatarImage} alt="" />}
              </div>
              <div className="details">
                <h2>
                  {this.props.region} - {this.props.realm}
                </h2>
                <h1 className="name">{this.props.name}</h1>
              </div>
            </div>
          </div>
          <nav>
            <div className="container">
              <ul>
                <li>
                  Raid
                  <select
                    className="form-control"
                    value={this.state.activeZoneID}
                    onChange={(e) =>
                      this.updateZoneMetricBoss(
                        Number(e.target.value),
                        this.state.metric,
                        BOSS_DEFAULT_ALL_BOSSES,
                      )
                    }
                  >
                    {Object.values(this.zones)
                      .reverse()
                      .map((elem) => (
                        <option key={elem.id} value={elem.id}>
                          {elem.name}
                        </option>
                      ))}
                  </select>
                </li>
                <li>
                  Boss
                  <select
                    className="form-control"
                    value={this.state.activeEncounter}
                    onChange={(e) => this.setState({ activeEncounter: Number(e.target.value) })}
                    defaultValue={BOSS_DEFAULT_ALL_BOSSES}
                  >
                    <option value={BOSS_DEFAULT_ALL_BOSSES}>All bosses</option>
                    {this.zoneBosses?.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </li>
                <li>
                  Metric
                  <select
                    className="form-control"
                    value={this.state.metric}
                    onChange={(e) =>
                      this.updateZoneMetricBoss(
                        this.state.activeZoneID,
                        e.target.value,
                        this.state.activeEncounter,
                      )
                    }
                    defaultValue="dps"
                  >
                    <option value="dps">DPS</option>
                    <option value="hps">HPS</option>
                  </select>
                </li>
                <li>
                  Sort by
                  <select
                    className="form-control"
                    value={this.state.sortBy}
                    onChange={(e) => this.setState({ sortBy: Number(e.target.value) })}
                    defaultValue={ORDER_BY.DATE}
                  >
                    <option value={ORDER_BY.DATE}>Date</option>
                    <option value={ORDER_BY.DPS}>DPS / HPS</option>
                    <option value={ORDER_BY.PERCENTILE}>Percentile</option>
                  </select>
                </li>
              </ul>
            </div>
          </nav>
        </header>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="panel character-filters">
                {this.state.specs.map((specName, index) => (
                  <div
                    key={index}
                    onClick={() => this.updateSpec(specName.en.replace(' ', ''))}
                    className={
                      this.state.activeSpec.includes(specName.en.replace(' ', ''))
                        ? 'selected spec-filter character-filter'
                        : 'spec-filter character-filter'
                    }
                    style={{ backgroundImage: `url(${this.iconPath(specName.en)})` }}
                  >
                    {specName.translated}
                  </div>
                ))}

                {Object.values(this.difficulties).map((difficultyId) => (
                  <div
                    key={difficultyId}
                    onClick={() => this.updateDifficulty(difficultyId)}
                    className={
                      this.state.activeDifficultyIds.includes(difficultyId)
                        ? 'selected diff-filter character-filter'
                        : 'diff-filter character-filter'
                    }
                  >
                    {getDifficultyLabel(difficultyId)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {this.state.error && (
                <span>
                  <Link to="/">
                    <Trans id="interface.characterParses.characterParses.home">Home</Trans>
                  </Link>{' '}
                  &gt;{' '}
                  <span>
                    {this.props.region} &gt; {this.props.realm} &gt; {this.props.name}
                  </span>
                  <br />
                  <br />
                </span>
              )}
              <div className="panel" style={{ overflow: 'auto' }}>
                {!this.state.isLoading && (
                  <div className="panel-heading">
                    <div className="pull-right">
                      <Link
                        to=""
                        onClick={(e) => {
                          e.preventDefault();
                          this.load(true);
                        }}
                      >
                        <span className="glyphicon glyphicon-refresh" aria-hidden="true" />{' '}
                        <Trans id="interface.characterParses.characterParses.refresh">
                          Refresh
                        </Trans>
                      </Link>
                    </div>
                    <h1 style={{ display: 'inline-block' }}>
                      {this.state.error ? (
                        i18n._(this.state.error)
                      ) : (
                        <Trans id="interface.characterParses.characterParses.parses">Parses</Trans>
                      )}
                    </h1>
                    <small>
                      <Trans id="interface.characterParses.characterParses.parsesDetails">
                        This page will only show fights that have been ranked by Warcraft Logs.
                        Wipes are not included and during busy periods there might be a delay before
                        new reports appear. Manually find the report on Warcraft Logs and copy the
                        direct report link to analyze a fight missing from this page.
                      </Trans>
                    </small>
                  </div>
                )}
                <div className="panel-body">
                  <div className="flex-main" style={{ padding: errorMessage ? 20 : 0 }}>
                    {this.state.isLoading && !this.state.error && (
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: '2em',
                          margin: '20px 0',
                        }}
                      >
                        <ActivityIndicator
                          text={
                            <Trans id="interface.characterParses.characterParses.fetchingLogs">
                              Fetching logs...
                            </Trans>
                          }
                        />
                      </div>
                    )}
                    {!this.state.isLoading && errorMessage}
                    {!this.state.isLoading && (
                      <ParsesList
                        isClassic={this.isClassic}
                        parses={this.filterParses}
                        class={this.state.class}
                        metric={this.state.metric}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, {
  appendReportHistory,
})(CharacterParses);
