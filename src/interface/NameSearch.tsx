import { defineMessage, t, Trans } from '@lingui/macro';
import { makeCharacterApiUrl, makeGuildApiUrl } from 'common/makeApiUrl';
import makeCharacterPageUrl from 'common/makeCharacterPageUrl';
import makeGuildPageUrl from 'common/makeGuildPageUrl';
import { REALM_LIST, CLASSIC_REALM_LIST } from 'game/RealmList';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectSearch from 'react-select-search';
import { useLingui } from '@lingui/react';
import { RETAIL_EXPANSION_NAME, CLASSIC_EXPANSION_NAME } from 'game/Expansion';

export enum SearchType {
  CHARACTER = 'Character',
  GUILD = 'Guild',
}

interface Props {
  type: SearchType;
}
const NameSearch = ({ type }: Props) => {
  const retailExpansion = RETAIL_EXPANSION_NAME.toUpperCase();
  const classicExpansion = CLASSIC_EXPANSION_NAME.toUpperCase();
  const [loading, setLoading] = useState(false);
  const [currentGame, setCurrentGame] = useState(retailExpansion);
  const [currentRealms, setCurrentRealms] = useState(REALM_LIST);
  const [currentRegion, setCurrentRegion] = useState('EU');
  const [currentRealm, setCurrentRealm] = useState('');
  const gameInput = useRef<HTMLSelectElement>(null);
  const regionInput = useRef<HTMLSelectElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { i18n } = useLingui();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const game = gameInput.current?.value;
      const region = regionInput.current?.value;
      const realm = currentRealm;
      const name = nameInput.current?.value;
      const makePageUrl = type === SearchType.CHARACTER ? makeCharacterPageUrl : makeGuildPageUrl;

      if (!game || !region || !realm || !name) {
        alert(
          i18n._(
            defineMessage({
              id: 'interface.nameSearch.pleaseSelect',
              message: `Please select a game, region, realm, and guild.`,
            }),
          ),
        );
        return;
      }

      // Checking for guild-exists here makes it more user-friendly and saves WCL-requests when guild doesn't exist
      if (loading) {
        alert(
          i18n._(
            defineMessage({
              id: 'interface.nameSearch.stillWorking',
              message: `Still working...`,
            }),
          ),
        );
        return;
      }
      setLoading(true);
      // There is no API for CN or Classic
      if (game === retailExpansion && region !== 'CN') {
        let response;
        if (type === SearchType.GUILD) {
          response = await fetch(makeGuildApiUrl(region, realm, name));
        } else {
          response = await fetch(makeCharacterApiUrl(undefined, region, realm, name));
        }
        if (response.status === 500) {
          alert(
            i18n._(
              defineMessage({
                id: 'interface.nameSearch.noResponse',
                message: `It looks like we couldn't get a response in time from the API. Try and paste your report-code manually.`,
              }),
            ),
          );
          setLoading(false);
          return;
        } else if (response.status === 404) {
          alert(
            i18n._(
              defineMessage({
                id: 'interface.nameSearch.nameNotFound',
                message: `${name} not found on ${realm}. Double check the game, region, realm, and name.`,
              }),
            ),
          );
          setLoading(false);
          return;
        } else if (!response.ok) {
          alert(
            i18n._(
              defineMessage({
                id: 'interface.nameSearch.noAPIResponse',
                message: `It looks like we couldn't get a response in time from the API, this usually happens when the servers are under heavy load. Please try and use your report-code or try again later.`,
              }),
            ),
          );
          setLoading(false);
          return;
        }
      }
      if (game === classicExpansion) {
        navigate(makePageUrl(region, realm, name, true));
      } else {
        navigate(makePageUrl(region, realm, name));
      }
    },
    [currentRealm, type, loading, navigate, i18n, classicExpansion, retailExpansion],
  );

  const changeGame = (targetGame: string) => {
    if (targetGame === retailExpansion) {
      setCurrentRealms(REALM_LIST);
    } else {
      setCurrentRealms(CLASSIC_REALM_LIST);
    }
    setCurrentGame(targetGame);
    if (currentRegion === 'CN') {
      setCurrentRegion('EU');
    } else {
      setCurrentRegion(currentRegion);
    }
    setCurrentRealm('');
  };

  const changeRegion = (targetRegion: string) => {
    let newRealm = currentRealm;
    // If the new region doesn't have a realm by the same name, clear the input
    if (!currentRealms[targetRegion].some((realm) => realm.name === newRealm)) {
      newRealm = '';
    }
    setCurrentRegion(targetRegion);
    setCurrentRealm(newRealm);
  };

  useEffect(() => {
    regionInput.current?.focus();
  }, []);

  const namePlaceholder =
    type === SearchType.CHARACTER
      ? defineMessage({
          id: 'interface.nameSearch.character',
          message: `Character`,
        })
      : defineMessage({
          id: 'interface.nameSearch.guild',
          message: `Guild`,
        });
  return (
    <form onSubmit={handleSubmit} className="character-guild-selector">
      <select
        className="form-control game"
        ref={gameInput}
        defaultValue={currentGame}
        onChange={(e) => changeGame(e.target.value)}
      >
        <option key="retail" value={retailExpansion}>
          {retailExpansion}
        </option>
        <option key="classic" value={classicExpansion}>
          {classicExpansion}
        </option>
      </select>
      <select
        className="form-control region"
        ref={regionInput}
        defaultValue={currentRegion}
        onChange={(e) => changeRegion(e.target.value)}
      >
        {Object.keys(currentRealms).map((elem) => (
          <option key={elem} value={elem}>
            {elem}
          </option>
        ))}
      </select>
      <SelectSearch
        key={currentRegion}
        className="realm"
        search
        options={currentRealms[currentRegion].map((elem) => ({
          value: elem.name,
          name: elem.name,
        }))}
        value={currentRealm}
        onChange={(value) => {
          if (typeof value === 'string') {
            setCurrentRealm(value);
          }
        }}
        placeholder={t({
          id: 'interface.nameSearch.realm',
          message: `Realm`,
        })}
      />
      <input
        type="text"
        name="code"
        ref={nameInput}
        className="name form-control"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder={i18n._(namePlaceholder)}
      />
      <button
        type="submit"
        className={`btn btn-primary analyze animated-button ${loading ? 'fill-button' : ''}`}
      >
        <Trans id="interface.nameSearch.search">Search</Trans>{' '}
        <span className="glyphicon glyphicon-chevron-right" aria-hidden />
      </button>
    </form>
  );
};

export default NameSearch;
