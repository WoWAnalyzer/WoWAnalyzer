import CoreChangelog from 'CHANGELOG';
import { ChangelogEntry } from 'common/changelog';
import contributors, { Character, Contributor } from 'common/contributor';
import SPECS from 'game/SPECS';
import { Expandable } from 'interface/Expandable';
import DropdownIcon from 'interface/icons/Dropdown';
import Panel from 'interface/Panel';
import SpecIcon from 'interface/SpecIcon';
import AVAILABLE_CONFIGS from 'parser';
import { ReactNode, useEffect } from 'react';
import * as React from 'react';
import { i18n } from '@lingui/core';

interface Props {
  contributorId: string;
  ownPage?: boolean;
}

const ContributorDetails = ({ contributorId, ownPage }: Props) => {
  useEffect(() => {
    if (ownPage) {
      return;
    }

    document.body.classList.toggle('no-scroll');

    return () => document.body.classList.remove('no-scroll');
  }, [ownPage]);

  //region Layout-Helpers

  const removeWhiteSpaces = (string: string) => {
    return string.replace(' ', '');
  };

  const renderCharacter = (character: Character) => {
    return (
      <div key={character.name}>
        <a href={character.link} className={removeWhiteSpaces(i18n._(character.spec.className))}>
          <SpecIcon spec={character.spec} /> {character.name}
        </a>
      </div>
    );
  };

  const filterChangelog = (contribution: ChangelogEntry) => {
    return contribution.contributors.includes(contributors[contributorId]);
  };

  const contributionHeader = (spec: number) => {
    if (spec === 0) {
      return (
        <>
          <img
            src="/favicon.png"
            style={{ height: '2em', width: '2em', marginRight: 10 }}
            alt="Core"
          />
          Core
        </>
      );
    }

    const specName = SPECS[spec].specName;
    return (
      <>
        <SpecIcon spec={SPECS[spec]} style={{ height: '2em', width: '2em', marginRight: 10 }} />
        {specName ? i18n._(specName) : null} {i18n._(SPECS[spec].className)}
      </>
    );
  };

  const links = (object: Record<string, string> | undefined) => {
    if (!object) {
      return null;
    }

    const value: ReactNode[] = [];
    Object.keys(object).forEach((key) => {
      value.push(
        <div>
          <a href={object[key]} target="_blank" rel="noopener noreferrer">
            {key}
          </a>
        </div>,
      );
    });

    return (
      <div className="row" style={{ marginBottom: 20 }}>
        <div className="col-md-3">
          <b>Links:</b>
        </div>
        <div className="col-md-9">{value}</div>
      </div>
    );
  };

  const additionalInfo = (object: Contributor['others']) => {
    if (object === undefined) {
      return null;
    }

    const value: React.ReactNode[] = [];
    Object.keys(object).forEach((key) => {
      const info = object[key];
      if (Array.isArray(info)) {
        const subvalue: React.ReactNode[] = [];
        info.forEach((elem) => {
          subvalue.push(<div>{elem}</div>);
        });

        value.push(
          <div className="row">
            <div className="col-md-3">
              <b>{key}:</b>
            </div>
            <div className="col-md-9">{subvalue}</div>
          </div>,
        );
      } else if (typeof info === 'string') {
        value.push(
          <div className="row">
            <div className="col-md-3">
              <b>{key}:</b>
            </div>
            <div className="col-md-9">{object[key]}</div>
          </div>,
        );
      }
    });

    return value;
  };

  const getMaintaine = () => {
    const maintainedSpecs = AVAILABLE_CONFIGS.filter(
      (elem) =>
        elem.contributors.filter((contributor) => contributor.nickname === contributorId).length >
        0,
    ).map((config) => config.spec);
    if (maintainedSpecs.length === 0) {
      return null;
    }

    return (
      <div className="row">
        <div className="col-md-3">
          <b>Maintainer:</b>
        </div>
        <div className="col-md-9">
          {maintainedSpecs.map((spec) => (
            <div key={spec.id} className={removeWhiteSpaces(i18n._(spec.className))}>
              <SpecIcon spec={spec} /> {spec.specName ? i18n._(spec.specName) : null}{' '}
              {i18n._(spec.className)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const chars = (contributor: Contributor, mains: boolean) => {
    const characters = mains ? contributor.mains : contributor.alts;
    if (!characters) {
      return null;
    }

    const style = mains ? { marginTop: 20 } : { marginBottom: 20 };
    return (
      <div className="row" style={style}>
        <div className="col-md-3">
          <b>{mains ? 'Mains' : 'Alts'}:</b>
        </div>
        <div className="col-md-9">{characters.map((char) => renderCharacter(char))}</div>
      </div>
    );
  };

  const text = (text: string | undefined, title: string) => {
    if (!text) {
      return null;
    }

    return (
      <div className="row">
        <div className="col-md-3">
          <b>{title}:</b>
        </div>
        <div className="col-md-9">{text}</div>
      </div>
    );
  };

  const invalidContributor = () => {
    return (
      <section>
        <header>
          <div className="row">
            <div className="col-md-12">
              <h1>Invalid Contributor</h1>
            </div>
          </div>
        </header>
      </section>
    );
  };

  const contributor: Contributor | undefined = contributors[contributorId];

  if (!contributor) {
    return invalidContributor();
  }

  const initial: Record<number, ChangelogEntry[]> = { 0: CoreChangelog };
  const contributions = AVAILABLE_CONFIGS.reduce((obj, elem) => {
    obj[elem.spec.id] = elem.changelog ?? [];
    return obj;
  }, initial);

  Object.keys(contributions)
    .map(Number)
    .forEach((key) => {
      contributions[key] = contributions[key].filter(filterChangelog);
      if (contributions[key].length === 0) {
        delete contributions[key];
      }
    });

  if (!contributor.avatar) {
    contributor.avatar = '/favicon.png';
  }

  return (
    <div className="contributor-detail">
      <div className="flex-main">
        <div className="row">
          <div className="col-md-5">
            <Panel title={contributor.nickname}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={contributor.avatar}
                  alt="Avatar"
                  style={{ marginTop: 20, maxHeight: 200, borderRadius: '50%' }}
                />
              </div>
              <div className="flex-main contributorlist">
                {text(contributor.about, 'About')}
                <div className="row">
                  <div className="col-md-3">
                    <b>GitHub:</b>
                  </div>
                  <div className="col-md-9">
                    <a
                      href={'https://github.com/' + contributor.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {contributor.github}
                    </a>
                  </div>
                </div>
                {text(contributor.discord, 'Discord')}
                {getMaintaine()}
                {links(contributor.links)}
                {additionalInfo(contributor.others)}
                {chars(contributor, true)}
                {chars(contributor, false)}
              </div>
            </Panel>
          </div>

          <div className="col-md-7">
            <Panel title="Contributions this expansion" pad={false}>
              <ul className="list">
                {Object.keys(contributions)
                  .map(Number)
                  .map((type, index) => (
                    <Expandable
                      key={index}
                      element="li"
                      header={
                        <div className="flex">
                          <div className="flex-main name">
                            {contributionHeader(type)} ({contributions[type].length}{' '}
                            {contributions[type].length === 1 ? 'change' : 'changes'})
                          </div>
                          <div className="flex-sub chevron">
                            <DropdownIcon />
                          </div>
                        </div>
                      }
                    >
                      <ul className="list text depad">
                        {contributions[type].map((contribution, index) => (
                          <li key={index} className="row">
                            <div className="col-md-2">{contribution.date.toLocaleDateString()}</div>
                            <div className="col-md-10">{contribution.changes}</div>
                          </li>
                        ))}
                      </ul>
                    </Expandable>
                  ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContributorDetails;
