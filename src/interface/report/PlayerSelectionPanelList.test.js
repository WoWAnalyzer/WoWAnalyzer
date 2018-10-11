import React from 'react';
import { shallow /*mount*/ } from 'enzyme';
// import { MemoryRouter } from 'react-router-dom';

import { PlayerSelectionPanelList } from './PlayerSelectionPanelList';

const playerId = 11;
const defaultProps = {
  report: {
    code: 'MY_REPORT_CODE',
    friendlies: [
      {
        id: playerId,
        name: 'Zerotorescue',
      },
    ],
    fights: [
      {
        id: 2,
        kill: true,
        start_time: 0,
        end_time: 0,
        name: 'Test Fight',
      },
    ],
  },
  fight: {
    id: 2,
    kill: true,
    start_time: 0,
    end_time: 0,
    name: 'Test Fight',
  },
};

describe('PlayerSelectionList', () => {
  // it('matches snapshot', () => {
  //   const tree = mount((
  //     <MemoryRouter>
  //       <PlayerSelectionList
  //         {...defaultProps}
  //         combatants={[
  //           {
  //             sourceID: playerId,
  //             specID: 65,
  //           },
  //         ]}
  //       />
  //     </MemoryRouter>
  //   ));
  //   expect(tree).toMatchSnapshot();
  // });
  it('matches snapshot when combatants list is empty', () => {
    const tree = shallow((
      <PlayerSelectionPanelList
        {...defaultProps}
        combatants={[]}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('does not show combatants with missing specID', () => {
    // This happens for bugged combatantinfo events as found here: CJBdLf3c2zQXkPtg/13-Heroic+Kil'jaeden+-+Kill+(7:40)
    const tree = shallow((
      <PlayerSelectionPanelList
        {...defaultProps}
        combatants={[
          {
            sourceID: playerId,
            specID: 1,
          },
        ]}
      />
    ));
    expect(tree).toMatchSnapshot();
  });
  it('shows a loading indicator when still loading', () => {
    const tree = shallow((
      <PlayerSelectionPanelList
        {...defaultProps}
        combatants={null}
      />
    ));
    expect(tree.find('ActivityIndicator').exists()).toBe(true);
  });
});
