import React, { FormEvent, RefObject } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore react-select-search has a broken import so we need to manually do it. See https://github.com/tbleckert/react-select-search/issues/120
import SelectSearch from 'react-select-search/dist/cjs';
import { Trans, t } from '@lingui/macro';
import { makeGuildApiUrl, makeCharacterApiUrl } from 'common/makeApiUrl';
import makeGuildPageUrl from 'common/makeGuildPageUrl';
import makeCharacterPageUrl from 'common/makeCharacterPageUrl';
import REALMS from 'game/RealmList';

export enum SearchType {
  CHARACTER = 'Character',
  GUILD = 'Guild',
}

interface State {
  loading: boolean;
  currentRegion: string;
  currentRealm: string;
}

interface Props extends RouteComponentProps {
  type: SearchType;
}

class NameSearch extends React.PureComponent<Props, State> {
  state = {
    loading: false,
    currentRegion: 'EU',
    currentRealm: '',
  };

  regionInput: RefObject<HTMLSelectElement>;
  nameInput: RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    this.regionInput = React.createRef();
    this.nameInput = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.changeRegion = this.changeRegion.bind(this);
  }

  componentDidMount() {
    if (this.regionInput.current) {
      this.regionInput.current.focus();
    }
  }

  async handleSubmit(e: FormEvent) {
    e.preventDefault();

    const region = this.regionInput.current?.value;
    const realm = this.state.currentRealm;
    const name = this.nameInput.current?.value;
    const makePageUrl =
      this.props.type === SearchType.CHARACTER ? makeCharacterPageUrl : makeGuildPageUrl;
    if (!region || !realm || !name) {
      alert(t({
        id: "interface.nameSearch.pleaseSelect",
        message: `Please select a region, realm, and guild.`
      }));
      return;
    }

    // Checking for guild-exists here makes it more userfriendly and saves WCL-requests when guild doesn't exist
    if (this.state.loading) {
      alert(t({
        id: "interface.nameSearch.stillWorking",
        message: `Still working...`
      }));
      return;
    }
    this.setState({ loading: true });
    // Skip CN-API due to blizzard restrictions (aka there is no API for CN)
    if (region !== 'CN') {
      let response;
      if (this.props.type === SearchType.GUILD) {
        response = await fetch(makeGuildApiUrl(region, realm, name));
      } else {
        response = await fetch(makeCharacterApiUrl(undefined, region, realm, name));
      }
      if (response.status === 500) {
        alert(
          t({
            id: "interface.nameSearch.noResponse",
            message: `It looks like we couldn't get a response in time from the API. Try and paste your report-code manually.`
          }),
        );
        this.setState({
          loading: false,
        });
        return;
      } else if (response.status === 404) {
        alert(t({
          id: "interface.nameSearch.nameNotFound",
          message: `${name} not found on ${realm}. Double check the region, realm, and name.`
        }));
        this.setState({
          loading: false,
        });
        return;
      } else if (!response.ok) {
        alert(
          t({
            id: "interface.nameSearch.noAPIResponse",
            message: `It looks like we couldn't get a response in time from the API, this usually happens when the servers are under heavy load. Please try and use your report-code or try again later.`
          }),
        );
        this.setState({
          loading: false,
        });
        return;
      }
    }
    this.props.history.push(makePageUrl(region, realm, name));
  }

  changeRegion(targetRegion: string) {
    let newRealm = this.state.currentRealm;
    // If the new region doesn't have a realm by the same name, clear the input
    if (!REALMS[targetRegion].some(realm => realm.name === newRealm)) {
      newRealm = '';
    }
    this.setState({
      currentRegion: targetRegion,
      currentRealm: newRealm,
    });
  }

  render() {
    const namePlaceholder = this.props.type === SearchType.CHARACTER ? t({
      id: "interface.nameSearch.character",
      message: `Character`
    }) : t({
      id: "interface.nameSearch.guild",
      message: `Guild`
    });
    return (
      <form onSubmit={this.handleSubmit} className="character-guild-selector">
        <select
          className="form-control region"
          ref={this.regionInput}
          defaultValue={this.state.currentRegion}
          onChange={e => this.changeRegion(e.target.value)}
        >
          {Object.keys(REALMS).map(elem => (
            <option key={elem} value={elem}>
              {elem}
            </option>
          ))}
        </select>
        <SelectSearch
          key={this.state.currentRegion}
          className="realm"
          search
          options={REALMS[this.state.currentRegion].map(elem => ({
            value: elem.name,
            name: elem.name,
          }))}
          value={this.state.currentRealm}
          onChange={(value: string) => {
            this.setState({
              currentRealm: value,
            });
          }}
          placeholder={t({
            id: "interface.nameSearch.realm",
            message: `Realm`
          })}
        />
        <input
          type="text"
          name="code"
          ref={this.nameInput}
          className="name form-control"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={namePlaceholder}
        />
        <button
          type="submit"
          className={`btn btn-primary analyze animated-button ${
            this.state.loading ? 'fill-button' : ''
          }`}
        >
          <Trans id="interface.nameSearch.search">Search</Trans> <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
      </form>
    );
  }
}

export default withRouter(NameSearch);
