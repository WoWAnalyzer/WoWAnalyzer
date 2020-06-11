import React, { FormEvent, RefObject } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
// @ts-ignore TODO "make a separate declare module file anyway so it can be extended later with actual typing"
import SelectSearch from 'react-select-search';
import { Trans, t } from '@lingui/macro';
import REALMS from 'common/RealmList';
import { makeGuildApiUrl, makeCharacterApiUrl } from 'common/makeApiUrl';
import { i18n } from 'interface/RootLocalizationProvider';
import makeGuildPageUrl from 'common/makeGuildPageUrl';
import makeCharacterPageUrl from 'common/makeGuildPageUrl';

export enum SearchType {
  CHARACTER = "Character",
  GUILD = "Guild",
}

interface State {
  loading: boolean,
  currentRegion: string,
  currentRealm: string,
}

interface Props extends RouteComponentProps {type: SearchType}

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
    const makePageUrl = this.props.type === SearchType.CHARACTER ? makeCharacterPageUrl : makeGuildPageUrl;
    if (!region || !realm || !name) {
      alert(i18n._(t`Please select a region, realm, and guild.`));
      return;
    }

    // Checking for guild-exists here makes it more userfriendly and saves WCL-requests when guild doesn't exist
    if (this.state.loading) {
      alert(i18n._(t`Still working...`));
      return;
    }
    this.setState({ loading: true });
    // Skip CN-API due to blizzard restrictions (aka there is no API for CN)
    if (region !== 'CN') {
      const makeApiUrl = this.props.type === SearchType.CHARACTER ? makeCharacterApiUrl : makeGuildApiUrl;
      const response = await fetch(makeApiUrl(region, realm, name));
      if (response.status === 500) {
        alert(i18n._(t`It looks like we couldn't get a response in time from the API. Try and paste your report-code manually.`));
        this.setState({
          loading: false,
        });
        return;
      } else if (response.status === 404) {
        alert(i18n._(t`${name} not found on ${realm}. Double check the region, realm, and name.`));
        this.setState({
          loading: false,
        });
        return;
      } else if (!response.ok) {
        alert(i18n._(t`It looks like we couldn't get a response in time from the API, this usually happens when the servers are under heavy load. Please try and use your report-code or try again later.`));
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
    const namePlaceholder = this.props.type === SearchType.CHARACTER ? t`Character` : t`Guild`;
    return (
      <form onSubmit={this.handleSubmit} className="character-guild-selector">
        <select
          className="form-control region"
          ref={this.regionInput}
          defaultValue={this.state.currentRegion}
          onChange={e => this.changeRegion(e.target.value)}
        >
          {Object.keys(REALMS).map(elem =>
            <option key={elem} value={elem}>{elem}</option>,
          )}
        </select>
        <SelectSearch
          options={REALMS[this.state.currentRegion].map((elem) => ({
            value: elem.name,
            name: elem.name,
          }))}
          className="realm"
          value={this.state.currentRealm}
          onChange={(value: any) => {
            this.setState({ currentRealm: value.value });
          }}
          placeholder={i18n._(t`Realm`)}
          key={this.state.currentRegion}
        />
        <input
          type="text"
          name="code"
          ref={this.nameInput}
          className="name form-control"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={i18n._(namePlaceholder)}
        />
        <button type="submit" className={`btn btn-primary analyze animated-button ${this.state.loading ? 'fill-button' : ''}`}>
          <Trans>Search</Trans> <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
      </form>
    );
  }
}

export default withRouter(NameSearch);
