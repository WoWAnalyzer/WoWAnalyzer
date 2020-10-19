import React from 'react';
import { connect } from 'react-redux';
import { t } from '@lingui/macro';

import { getLanguage } from 'interface/selectors/language';
import { setLanguage } from 'interface/actions/language';
import ReadableListing from 'interface/ReadableListing';
import languages from 'common/languages';
import { i18n } from 'interface/RootLocalizationProvider';
import { TooltipElement } from 'common/Tooltip';

type Props = {
  language: string;
  setLanguage: Function;
}
type State = {
  expanded: boolean;
}

class LanguageSwitcher extends React.PureComponent<Props, State> {
  state: State = {
    expanded: false,
  };

  constructor(props: Props) {
    super(props);
    this.handleClickExpand = this.handleClickExpand.bind(this);
  }

  handleClickExpand() {
    this.setState({
      expanded: true,
    });
  }

  selectLanguage(code: string) {
    this.setState({
      expanded: false,
    });
    this.props.setLanguage(code);
  }
  renderExpanded() {
    return (
      <ReadableListing groupType="or">
        {Object.keys(languages).map(code => (
          <a key={code} onClick={() => this.selectLanguage(code)}>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
            {languages[code].localName}
          </a>
        ))}
      </ReadableListing>
    );
  }
  render() {
    const { language } = this.props;

    if (this.state.expanded) {
      return this.renderExpanded();
    }

    return (
      <a onClick={this.handleClickExpand}>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        <TooltipElement content={i18n._(t`Click to switch languages. We've only just started localizing the app, it will take some time until everything is localized.`)}>
          {languages[language].localName}
        </TooltipElement>
      </a>
    );
  }
}

const mapStateToProps = (state: State) => ({
  language: getLanguage(state),
});
export default connect(mapStateToProps, {
  setLanguage,
})(LanguageSwitcher);
