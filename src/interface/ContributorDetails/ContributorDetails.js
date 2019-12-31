import React from 'react';
import PropTypes from 'prop-types';

import * as contributors from 'CONTRIBUTORS';
import CoreChangelog from 'CHANGELOG';
import SPECS from 'game/SPECS';
import SpecIcon from 'common/SpecIcon';
import DropdownIcon from 'interface/icons/Dropdown';
import Panel from 'interface/others/Panel';
import Expandable from 'interface/common/Expandable';
import AVAILABLE_CONFIGS from 'parser';

class ContributorDetails extends React.PureComponent {
  static propTypes = {
    contributorId: PropTypes.string.isRequired,
    ownPage: PropTypes.bool,
  };

  constructor() {
    super();
    this.filterChangelog = this.filterChangelog.bind(this);
  }

  //region Layout-Helpers

  removeWhiteSpaces(string) {
    return string.replace(' ', '');
  }

  renderCharacter({ link, spec, name }) {
    return (
      <div>
        <a href={link} className={this.removeWhiteSpaces(spec.className)}>
          <SpecIcon id={spec.id} /> {name}
        </a>
      </div>
    );
  }

  filterChangelog(contribution) {
    return contribution.contributors.includes(contributors[this.props.contributorId]);
  }

  contributionHeader(spec) {
    if (spec === '0') {
      return (
        <>
          <img src="/favicon.png" style={{ height: '2em', width: '2em', marginRight: 10 }} alt="Core" />
          Core
        </>
      );
    }

    return (
      <>
        <SpecIcon id={Number(spec)} style={{ height: '2em', width: '2em', marginRight: 10 }} />
        {SPECS[spec].specName} {SPECS[spec].className}
      </>
    );
  }

  links(object) {
    if (!object) {
      return null;
    }

    const value = [];
    Object.keys(object).forEach((key) => {
      value.push(
        <div>
          <a href={object[key]} target="_blank" rel="noopener noreferrer">{key}</a>
        </div>,
      );
    });
    return (
      <div className="row" style={{ marginBottom: 20 }}>
        <div className="col-md-3"><b>Links:</b></div>
        <div className="col-md-9">
          {value}
        </div>
      </div>
    );
  }

  additionalInfo(object) {
    if (!object) {
      return null;
    }

    const value = [];
    Object.keys(object).forEach((key) => {
      if (Array.isArray(object[key])) {
        const subvalue = [];
        object[key].forEach((elem) => {
          subvalue.push(<div>{elem}</div>);
        });

        value.push(<div className="row">
          <div className="col-md-3"><b>{key}:</b></div>
          <div className="col-md-9">
            {subvalue}
          </div>
        </div>);

      } else if (typeof object[key] === 'string') {
        value.push(<div className="row">
          <div className="col-md-3"><b>{key}:</b></div>
          <div className="col-md-9">
            {object[key]}
          </div>
        </div>);
      }
    });
    return value;
  }

  get maintainer() {
    const maintainedSpecs = AVAILABLE_CONFIGS
      .filter(elem => elem.contributors.filter(contributor => contributor.nickname === this.props.contributorId).length > 0)
      .map(config => config.spec);
    if (maintainedSpecs.length === 0) {
      return null;
    }

    return (
      <div className="row">
        <div className="col-md-3"><b>Maintainer:</b></div>
        <div className="col-md-9">
          {maintainedSpecs.map(spec => (
            <div key={spec.id} className={this.removeWhiteSpaces(spec.className)}>
              <SpecIcon id={spec.id} /> {spec.specName} {spec.className}
            </div>
          ))}
        </div>
      </div>
    );
  }

  chars(contributor, typ) {
    if (!contributor[typ]) {
      return null;
    }

    const style = typ === 'mains' ? { marginTop: 20 } : { marginBottom: 20 };
    return (
      <div className="row" style={style}>
        <div className="col-md-3"><b>{typ[0].toUpperCase() + typ.slice(1)}:</b></div>
        <div className="col-md-9">
          {contributor[typ].map(char => this.renderCharacter(char))}
        </div>
      </div>
    );
  }

  text(contributor, text) {
    if (!contributor) {
      return null;
    }

    return (
      <div className="row">
        <div className="col-md-3"><b>{text}:</b></div>
        <div className="col-md-9">
          {contributor}
        </div>
      </div>
    );
  }

  invalidContributor() {
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
  }

  componentDidMount() {
    if (this.props.ownPage) {
      return;
    }

    document.body.classList.toggle('no-scroll');
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.ownPage) {
      return;
    }

    document.body.classList.toggle('no-scroll');
  }
  componentWillUnmount() {
    if (this.props.ownPage) {
      return;
    }

    document.body.classList.remove('no-scroll');
  }

  //endregion

  render() {
    const { contributorId } = this.props;
    const contributor = contributors[contributorId];

    if (!contributor) {
      return this.invalidContributor();
    }

    const contributions = AVAILABLE_CONFIGS.reduce((obj, elem) => {
      obj[elem.spec.id] = elem.changelog;
      return obj;
    }, {
      0: CoreChangelog,
    });

    Object.keys(contributions).forEach(key => {
      contributions[key] = contributions[key].filter(this.filterChangelog);
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
              <Panel
                title={contributor.nickname}
              >
                <div style={{ textAlign: 'center' }}>
                  <img src={contributor.avatar} alt="Avatar" style={{ marginTop: 20, maxHeight: 200, borderRadius: '50%' }} />
                </div>
                <div className="flex-main contributorlist">
                  {this.text(contributor.about, 'About')}
                  <div className="row">
                    <div className="col-md-3"><b>GitHub:</b></div>
                    <div className="col-md-9">
                      <a href={'https://github.com/' + contributor.github} target="_blank" rel="noopener noreferrer">{contributor.github}</a>
                    </div>
                  </div>
                  {this.text(contributor.discord, 'Discord')}
                  {this.maintainer}
                  {this.links(contributor.links)}
                  {this.additionalInfo(contributor.others)}
                  {this.chars(contributor, 'mains')}
                  {this.chars(contributor, 'alts')}
                </div>
              </Panel>
            </div>

            <div className="col-md-7">
              <Panel
                title="Contributions"
                pad={false}
              >
                <ul className="list">
                  {Object.keys(contributions).map((type, index) => (
                    <Expandable
                      key={index}
                      element="li"
                      header={(
                        <div className="flex">
                          <div className="flex-main name">
                            {this.contributionHeader(type)} ({contributions[type].length} commits)
                          </div>
                          <div className="flex-sub chevron">
                            <DropdownIcon />
                          </div>
                        </div>
                      )}
                    >
                      <ul className="list text depad">
                        {contributions[type].map((contribution, index) => (
                          <li key={index} className="row">
                            <div className="col-md-2">
                              {contribution.date.toLocaleDateString()}
                            </div>
                            <div className="col-md-10">
                              {contribution.changes}
                            </div>
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
  }
}

export default ContributorDetails;
