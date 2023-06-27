import { makeCharacterApiUrl, makeGuildApiUrl } from 'common/makeApiUrl';
import makeCharacterPageUrl from 'common/makeCharacterPageUrl';
import makeGuildPageUrl from 'common/makeGuildPageUrl';
import REALMS from 'game/RealmList';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectSearch from 'react-select-search';

export enum SearchType {
  CHARACTER = 'Character',
  GUILD = 'Guild',
}

interface Props {
  type: SearchType;
}
const NameSearch = ({ type }: Props) => {
  const [loading, setLoading] = useState(false);
  const [currentRegion, setCurrentRegion] = useState('EU');
  const [currentRealm, setCurrentRealm] = useState('');
  const regionInput = useRef<HTMLSelectElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const region = regionInput.current?.value;
      const realm = currentRealm;
      const name = nameInput.current?.value;
      const makePageUrl = type === SearchType.CHARACTER ? makeCharacterPageUrl : makeGuildPageUrl;

      if (!region || !realm || !name) {
        alert(`Please select a region, realm, and guild.`);
        return;
      }

      // Checking for guild-exists here makes it more userfriendly and saves WCL-requests when guild doesn't exist
      if (loading) {
        alert(`Still working...`);
        return;
      }
      setLoading(true);
      // Skip CN-API due to blizzard restrictions (aka there is no API for CN)
      if (region !== 'CN') {
        let response;
        if (type === SearchType.GUILD) {
          response = await fetch(makeGuildApiUrl(region, realm, name));
        } else {
          response = await fetch(makeCharacterApiUrl(undefined, region, realm, name));
        }
        if (response.status === 500) {
          alert(
            `It looks like we couldn't get a response in time from the API. Try and paste your report-code manually.`,
          );
          setLoading(false);
          return;
        } else if (response.status === 404) {
          alert(`${name} not found on ${realm}. Double check the region, realm, and name.`);
          setLoading(false);
          return;
        } else if (!response.ok) {
          alert(
            `It looks like we couldn't get a response in time from the API, this usually happens when the servers are under heavy load. Please try and use your report-code or try again later.`,
          );
          setLoading(false);
          return;
        }
      }

      navigate(makePageUrl(region, realm, name));
    },
    [currentRealm, navigate, loading, type],
  );

  const changeRegion = (targetRegion: string) => {
    let newRealm = currentRealm;
    // If the new region doesn't have a realm by the same name, clear the input
    if (!REALMS[targetRegion].some((realm) => realm.name === newRealm)) {
      newRealm = '';
    }
    setCurrentRegion(targetRegion);
    setCurrentRealm(newRealm);
  };

  useEffect(() => {
    regionInput.current?.focus();
  }, []);

  const namePlaceholder = type === SearchType.CHARACTER ? `Character` : `Guild`;
  return (
    <form onSubmit={handleSubmit} className="character-guild-selector">
      <select
        className="form-control region"
        ref={regionInput}
        defaultValue={currentRegion}
        onChange={(e) => changeRegion(e.target.value)}
      >
        {Object.keys(REALMS).map((elem) => (
          <option key={elem} value={elem}>
            {elem}
          </option>
        ))}
      </select>
      <SelectSearch
        key={currentRegion}
        className="realm"
        search
        options={REALMS[currentRegion].map((elem) => ({
          value: elem.name,
          name: elem.name,
        }))}
        value={currentRealm}
        onChange={(value) => {
          if (typeof value === 'string') {
            setCurrentRealm(value);
          }
        }}
        placeholder="Realm"
      />
      <input
        type="text"
        name="code"
        ref={nameInput}
        className="name form-control"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder={namePlaceholder}
      />
      <button
        type="submit"
        className={`btn btn-primary analyze animated-button ${loading ? 'fill-button' : ''}`}
      >
        <>Search</> <span className="glyphicon glyphicon-chevron-right" aria-hidden />
      </button>
    </form>
  );
};

export default NameSearch;
