import React from 'react';
import { Link } from 'react-router-dom';
import { i18n } from '@lingui/core';
import { Trans, defineMessage } from '@lingui/macro';

import ZONES from 'game/ZONES';
import fetchWcl, { GuildNotFoundError, UnknownApiError, WclApiError } from 'common/fetchWclApi';
import { WCLGuildReport, WCLGuildReportsResponse } from 'common/WCL_TYPES';
import { captureException } from 'common/errorLogger';
import retryingPromise from 'common/retryingPromise';
import { makeGuildApiUrl } from 'common/makeApiUrl';
import ActivityIndicator from 'interface/common/ActivityIndicator';
import ArmoryIcon from 'interface/icons/Armory';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';
import WipefestIcon from 'interface/icons/Wipefest';

import './GuildReports.scss';
import ReportsList from '../GuildReportsList';
import ALLIANCE_PICTURE from './images/ally_guild_banner_bwl.jpg';
import HORDE_PICTURE from './images/horde_guild_banner_onyx.jpg';

const loadRealms = () =>
  retryingPromise(() => import('common/RealmList').then((exports) => exports.default));

const ZONE_ALL = -1;
const ZONE_DEFAULT = ZONE_ALL;
const REPORTS_TO_SHOW = [25, 50, 100];
const REPORTS_TO_SHOW_DEFAULT = 25;
const MONTHS_BACK_SEARCH = 3;

const ERRORS = {
  GUILD_NOT_FOUND: defineMessage({
    id: 'interface.guildReports.errors.guildNotFound',
    message: `We couldn't find your guild on Warcraft Logs`,
  }),
  NO_REPORTS_FOR_FILTER: defineMessage({
    id: 'interface.guildReports.errors.noReportsForFilter',
    message: `We couldn't find any reports`,
  }),
  WCL_API_ERROR: defineMessage({
    id: 'interface.guildReports.errors.wclAPIError',
    message: `Something went wrong talking to Warcraft Logs`,
  }),
  UNKNOWN_API_ERROR: defineMessage({
    id: 'interface.guildReports.errors.unknownAPIError',
    message: `Something went wrong talking to the server`,
  }),
  UNEXPECTED: defineMessage({
    id: 'interface.guildReports.errors.unexpected',
    message: `Something went wrong`,
  }),
  NOT_RESPONDING: defineMessage({
    id: 'interface.guildReports.errors.notResponding',
    message: `Request timed out`,
  }),
};

interface Props {
  region: string;
  realm: string;
  name: string;
}

interface State {
  activeZoneID: number;
  reports: WCLGuildReport[];
  reportsToShow: number;
  isLoading: boolean;
  error: any; // TODO MessageDescriptor? convert to enum?
  errorMessage: any | null;
  realmSlug: string;
  factionImage: string;
}

class GuildReports extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeZoneID: ZONE_DEFAULT,
      reports: [],
      reportsToShow: REPORTS_TO_SHOW_DEFAULT,
      isLoading: true,
      error: null,
      errorMessage: null,
      realmSlug: props.realm,
      factionImage: HORDE_PICTURE,
    };
    this.load = this.load.bind(this);
  }

  async componentDidMount() {
    this.fetchBattleNetInfo();
  }

  async fetchBattleNetInfo() {
    const { region, realm, name } = this.props;

    // Skip CN-API due to blizzard restrictions (aka there is no API for CN)
    if (region === 'CN') {
      this.setState(
        {
          factionImage: HORDE_PICTURE,
        },
        () => {
          this.load();
        },
      );
      return;
    }
    // fetch guild faction
    const response = await fetch(makeGuildApiUrl(region, realm, name));

    // TODO do we care about these errors just for faction? we could
    //  let blizzard api fail silently and use WCL response for any real errors
    if (response.status === 500) {
      this.setState({
        isLoading: false,
        error: ERRORS.NOT_RESPONDING,
      });
      return;
    } else if (response.status === 404) {
      this.setState({
        isLoading: false,
        error: ERRORS.GUILD_NOT_FOUND,
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

    if (!data.faction) {
      // We definitely want to see this error I think so that we know if response format has changed
      this.setState({
        isLoading: false,
        error: ERRORS.UNEXPECTED,
        errorMessage: 'Corrupt Battle.net API response received.',
      });
      return;
    }
    this.setState({ factionImage: data.faction === 1 ? HORDE_PICTURE : ALLIANCE_PICTURE }, () => {
      this.load();
    });
  }

  get filterReports() {
    let filteredReports = this.state.reports;
    if (this.state.activeZoneID !== ZONE_ALL) {
      filteredReports = filteredReports.filter((elem) => this.state.activeZoneID === elem.zone);
    }
    filteredReports.sort((a, b) => b.start - a.start);
    return filteredReports.slice(0, this.state.reportsToShow);
  }

  async findRealm() {
    const realms = await loadRealms();
    // Use the slug from REALMS when available, otherwise try realm-prop and fail
    const realmsInRegion = realms[this.props.region];
    if (!realmsInRegion) {
      console.warn(
        `Region could not be found: ${this.props.region}. This generally indicates a bug.`,
      );
      return null;
    }
    const lowerCaseRealm = this.props.realm.toLowerCase();
    const realm = realmsInRegion.find((elem) => elem.name.toLowerCase() === lowerCaseRealm);
    if (!realm) {
      console.warn(
        `Realm could not be found: ${this.props.realm}. This generally indicates a bug.`,
      );
    }
    return realm;
  }

  async getRealmSlug() {
    const realm = await this.findRealm();
    return realm ? realm.slug : this.props.realm;
  }

  async load() {
    this.setState({
      isLoading: true,
    });

    const realm = await this.getRealmSlug();
    this.setState({
      realmSlug: realm,
    });

    const urlEncodedName = encodeURIComponent(this.props.name);
    const urlEncodedRealm = encodeURIComponent(realm);

    const filterStart = new Date();
    // TODO allow selection of a date range?
    filterStart.setMonth(filterStart.getMonth() - MONTHS_BACK_SEARCH);
    return fetchWcl<WCLGuildReportsResponse>(
      `reports/guild/${urlEncodedName}/${urlEncodedRealm}/${this.props.region}`,
      {
        start: filterStart.getTime(),
      },
    )
      .then((reports) => {
        if (reports.length === 0) {
          this.setState({
            reports: [],
            isLoading: false,
            error: ERRORS.NO_REPORTS_FOR_FILTER,
          });
          return;
        }
        this.setState({
          reports: reports,
          isLoading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (err instanceof GuildNotFoundError) {
          this.setState({
            error: ERRORS.GUILD_NOT_FOUND,
            isLoading: false,
          });
          return;
        }

        // For any WCL or unexpected errors, send to Sentry
        captureException(err);

        let errorType;
        if (err instanceof WclApiError) {
          errorType = ERRORS.WCL_API_ERROR;
        } else if (err instanceof UnknownApiError) {
          errorType = ERRORS.UNKNOWN_API_ERROR;
        } else {
          errorType = ERRORS.UNEXPECTED;
        }
        this.setState({
          error: errorType,
          errorMessage: err.message,
          isLoading: false,
        });
      });
  }

  render() {
    let errorMessage;
    const filteredReports = this.filterReports;

    const DISCORD = (
      <a href="https://discord.gg/AxphPxU" target="_blank" rel="noopener noreferrer">
        Discord
      </a>
    );
    const GITHUB = (
      <a
        href="https://github.com/WoWAnalyzer/WoWAnalyzer"
        target="_blank"
        rel="noopener noreferrer"
      >
        Github
      </a>
    );
    const WCL_GUIDE = (
      <a href="https://www.warcraftlogs.com/help/start/" target="_blank" rel="noopener noreferrer">
        Warcraft Logs guide
      </a>
    );

    if (this.state.error === ERRORS.GUILD_NOT_FOUND) {
      errorMessage = (
        <Trans id="interface.guildReports.errors.guildNotFoundDetails">
          Please check your input and make sure that you've selected the correct region and realm.
          <br />
          If your input was correct, then make sure that someone in your raid logged the fight for
          you or check out the {WCL_GUIDE} to get started with logging on your own.
          <br />
          <br />
          When you know for sure that you have logs on Warcraft Logs and you still get this error,
          please message us on {DISCORD} or create an issue on {GITHUB}.
        </Trans>
      );
    } else if (this.state.error === ERRORS.NOT_RESPONDING) {
      errorMessage = (
        <Trans id="interface.guildReports.errors.notRespondingDetails">
          It looks like we couldn't get a response in time from the API, this usually happens when
          the servers are under heavy load.
          <br />
          <br />
          You could try and enter your report-code manually <Link to="/">here</Link>.<br />
          That would bypass the guild lookup and we should be able to analyze your report.
          <br />
        </Trans>
      );
    } else if (
      this.state.error === ERRORS.WCL_API_ERROR ||
      this.state.error === ERRORS.UNKNOWN_API_ERROR ||
      this.state.error === ERRORS.UNEXPECTED
    ) {
      errorMessage = (
        <Trans id="interface.guildReports.errors.details">
          {this.state.errorMessage}
          <br />
          Please message us on {DISCORD} or create an issue on {GITHUB} if this issue persists and
          we will fix it, eventually.
        </Trans>
      );
    } else if (this.state.error === ERRORS.NO_REPORTS_FOR_FILTER || filteredReports.length === 0) {
      errorMessage = (
        <Trans id="interface.guildReports.errors.noReportsForFilterDetails">
          Please check your filters and make sure that you logged those fights on Warcraft Logs.
          <br />
          <br />
          Don't know how to log your fights? Check out the {WCL_GUIDE} to get started.
        </Trans>
      );
    }

    // Name slug for battle.net armory, standard name for WCL & wipefest
    const nameSlug = this.props.name.replace(/\s/g, '-').toLowerCase();
    let battleNetUrl = `https://worldofwarcraft.com/en-${this.props.region}/guild/${this.props.region}/${this.state.realmSlug}/${nameSlug}`;
    if (this.props.region === 'CN') {
      battleNetUrl = `https://www.wowchina.com/zh-cn/guild/${this.state.realmSlug}/${nameSlug}`;
    }

    return (
      <div className="results">
        <header>
          <div className="background">
            <div
              className="img"
              style={{
                backgroundImage: `url(${this.state.factionImage})`,
                backgroundSize: `cover`,
                backgroundPosition: 'center center',
              }}
            />
          </div>
          <div className="info container">
            <div>
              <a
                href={`https://www.warcraftlogs.com/guild/${this.props.region}/${this.state.realmSlug}/${this.props.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 22 }}
              >
                <WarcraftLogsIcon /> Warcraft Logs
              </a>
              <br />
              <a
                href={battleNetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ fontSize: 22 }}
              >
                <ArmoryIcon /> Armory
              </a>
              <br />
              {this.props.region !== 'CN' && (
                <a
                  href={`https://www.wipefest.gg/guild/${this.props.name}/${this.state.realmSlug}/${this.props.region}`}
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
              <h2>
                {this.props.region} - {this.props.realm}
              </h2>
              <h1>{this.props.name}</h1>
            </div>
          </div>
          <nav>
            <div className="container">
              <ul>
                <li style={{ height: 'auto' }}>
                  <select
                    className="form-control"
                    value={this.state.activeZoneID}
                    onChange={(e) => this.setState({ activeZoneID: Number(e.target.value) })}
                  >
                    <option key={ZONE_ALL} value={ZONE_ALL}>
                      All Zones
                    </option>
                    {Object.values(ZONES)
                      .reverse()
                      .map((elem) => (
                        <option key={elem.id} value={elem.id}>
                          {elem.name}
                        </option>
                      ))}
                  </select>
                </li>
                <li style={{ height: 'auto' }}>
                  <select
                    className="form-control"
                    value={this.state.reportsToShow}
                    onChange={(e) => this.setState({ reportsToShow: Number(e.target.value) })}
                    style={{ width: 'auto', float: 'right' }}
                  >
                    {REPORTS_TO_SHOW.map((elem) => (
                      <option key={elem} value={elem}>
                        {elem} reports
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
            </div>
          </nav>
        </header>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              {this.state.error && (
                <span>
                  <Link to="/">
                    <Trans id="interface.guildReports.home">Home</Trans>
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
                          this.load();
                        }}
                      >
                        <span className="glyphicon glyphicon-refresh" aria-hidden="true" />{' '}
                        <Trans id="interface.guildReports.refresh">Refresh</Trans>
                      </Link>
                    </div>
                    <h1 style={{ display: 'inline-block' }}>
                      {this.state.error ? (
                        i18n._(this.state.error)
                      ) : (
                        <Trans id="interface.guildReports.guildReports">Guild Reports</Trans>
                      )}
                    </h1>
                    <small>
                      <Trans id="interface.guildReports.guildReportsDetails">
                        This page will only show guild reports that are public and listed on
                        Warcraft Logs. If your reports are unlisted, you need to manually find the
                        report on Warcraft Logs and copy the direct report link to analyze a fight
                        missing from this page. If your reports are private, they can't be analyzed.
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
                            <Trans id="interface.guildReports.fetchingReports">
                              Fetching reports...
                            </Trans>
                          }
                        />
                      </div>
                    )}
                    {!this.state.isLoading && errorMessage}
                    {!this.state.isLoading && filteredReports.length > 0 && (
                      <ReportsList reports={filteredReports} />
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

export default GuildReports;
