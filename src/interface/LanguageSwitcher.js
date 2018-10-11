import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { t } from '@lingui/macro';

import { getLanguage } from 'interface/selectors/language';
import { setLanguage } from 'interface/actions/language';
import ReadableList from 'interface/common/ReadableList';
import languages from 'common/languages';
import { i18n } from 'interface/RootLocalizationProvider';

class LanguageSwitcher extends React.PureComponent {
  static propTypes = {
    language: PropTypes.string.isRequired,
    setLanguage: PropTypes.func.isRequired,
  };
  state = {
    expanded: false,
  };

  constructor() {
    super();
    this.handleClickExpand = this.handleClickExpand.bind(this);
  }

  componentDidUpdate() {
    ReactTooltip.hide();
    ReactTooltip.rebuild();
  }

  handleClickExpand() {
    this.setState({
      expanded: true,
    });
  }

  selectLanguage(code) {
    this.setState({
      expanded: false,
    });
    this.props.setLanguage(code);
  }
  renderExpanded() {
    return (
      <ReadableList groupType="or">
        {Object.keys(languages).map(code => (
          <a key={code} onClick={() => this.selectLanguage(code)}>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
            {languages[code].localName}
          </a>
        ))}
      </ReadableList>
    );
  }
  render() {
    const { language } = this.props;

    if (this.state.expanded) {
      return this.renderExpanded();
    }

    return (
      <a onClick={this.handleClickExpand}>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        <dfn data-tip={i18n._(t`Click to switch languages. We've only just started localizing the app, it will take some time until everything is localized.`)}>
          {languages[language].localName}
        </dfn>
      </a>
    );
  }
}

const mapStateToProps = state => ({
  language: getLanguage(state),
});
export default connect(mapStateToProps, {
  setLanguage,
})(LanguageSwitcher);
