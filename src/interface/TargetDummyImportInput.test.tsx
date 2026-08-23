import { fireEvent, render, screen } from '@testing-library/react';
import type { TargetDummyInputRequest } from 'local/localCombatLogProtocol';

import TargetDummyImportInput from './TargetDummyImportInput';

const request: TargetDummyInputRequest = {
  discovery: {
    actors: [
      {
        guid: 'Player-1',
        kind: 'player',
        name: 'Ada',
        flags: 0,
        sourceObservationCount: 3,
        targetObservationCount: 0,
      },
      {
        guid: 'Player-2',
        kind: 'player',
        name: 'Grace',
        flags: 0,
        sourceObservationCount: 2,
        targetObservationCount: 0,
      },
      {
        guid: 'Creature-1',
        kind: 'creature',
        name: 'Training Dummy',
        flags: 0,
        sourceObservationCount: 0,
        targetObservationCount: 5,
      },
      {
        guid: 'Creature-2',
        kind: 'creature',
        name: 'Cleave Dummy',
        flags: 0,
        sourceObservationCount: 0,
        targetObservationCount: 2,
      },
    ],
    players: [
      {
        guid: 'Player-1',
        kind: 'player',
        name: 'Ada',
        flags: 0,
        sourceObservationCount: 3,
        targetObservationCount: 0,
        recorderCandidate: true,
        outgoingCastCount: 2,
        outgoingDamageCount: 3,
        directHostileActionCount: 5,
        targetInteractionCount: 1,
        activityScore: 8,
      },
      {
        guid: 'Player-2',
        kind: 'player',
        name: 'Grace',
        flags: 0,
        sourceObservationCount: 2,
        targetObservationCount: 0,
        recorderCandidate: false,
        outgoingCastCount: 1,
        outgoingDamageCount: 1,
        directHostileActionCount: 2,
        targetInteractionCount: 1,
        activityScore: 3,
      },
    ],
    sessions: [
      {
        id: 'ada-attempt',
        playerGuid: 'Player-1',
        targetGuids: ['Creature-1', 'Creature-2'],
        activityStart: Date.UTC(2026, 7, 20, 12, 0, 0),
        fightStart: Date.UTC(2026, 7, 20, 11, 59, 55),
        end: Date.UTC(2026, 7, 20, 12, 0, 30),
        durationMs: 30_000,
        confidence: 'likely',
        reasons: ['multi-target'],
        qualifyingActionCount: 5,
        playerInitiatedActionCount: 3,
      },
      {
        id: 'grace-attempt',
        playerGuid: 'Player-2',
        targetGuids: ['Creature-1'],
        activityStart: Date.UTC(2026, 7, 20, 12, 1, 0),
        fightStart: Date.UTC(2026, 7, 20, 12, 0, 55),
        end: Date.UTC(2026, 7, 20, 12, 1, 10),
        durationMs: 10_000,
        confidence: 'possible',
        reasons: ['short-duration'],
        qualifyingActionCount: 2,
        playerInitiatedActionCount: 2,
      },
    ],
    ownedEntities: [],
    recordsScanned: 10,
    retainedState: {
      actorCount: 4,
      candidateWindowCount: 2,
      ownedEntityCount: 0,
      retainedRawLineCount: 0,
      retainedNormalizedEventCount: 0,
    },
  },
  diagnostics: [],
};

describe('TargetDummyImportInput', () => {
  it('shows only attempts for the selected character and submits the SimC profile', () => {
    const onSubmit = vi.fn();
    render(<TargetDummyImportInput request={request} disabled={false} onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Character')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Character'), { target: { value: 'Player-1' } });
    expect(
      screen.getByRole('radio', { name: /Ada.*Training Dummy and 1 more.*likely/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: /Training Dummy.*possible/ }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Character'), { target: { value: 'Player-2' } });
    expect(
      screen.queryByRole('radio', { name: /Ada.*Training Dummy and 1 more.*likely/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Grace.*Training Dummy.*possible/ }));
    fireEvent.change(screen.getByLabelText('SimulationCraft addon export'), {
      target: { value: '# SimulationCraft Addon\nwarrior="Grace"' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Import selected attempt' }));

    expect(onSubmit).toHaveBeenCalledWith({
      playerGuid: 'Player-2',
      sessionId: 'grace-attempt',
      simcProfile: '# SimulationCraft Addon\nwarrior="Grace"',
      factionChoice: undefined,
    });
  });

  it('keeps entered values when recoverable validation asks for a faction', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <TargetDummyImportInput request={request} disabled={false} onSubmit={onSubmit} />,
    );
    fireEvent.change(screen.getByLabelText('Character'), { target: { value: 'Player-1' } });
    fireEvent.click(screen.getByRole('radio', { name: /Ada.*Training Dummy and 1 more.*likely/ }));
    fireEvent.change(screen.getByLabelText('SimulationCraft addon export'), {
      target: { value: 'complete profile' },
    });

    const validationRequest: TargetDummyInputRequest = {
      ...request,
      validationError: {
        code: 'SIMC_FACTION_CHOICE_REQUIRED',
        message: 'The race does not identify one faction.',
        recoverable: true,
        suggestedAction: 'Choose the character faction.',
      },
    };
    rerender(
      <TargetDummyImportInput request={validationRequest} disabled={false} onSubmit={onSubmit} />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The race does not identify one faction. Choose the character faction.',
    );
    expect(screen.getByLabelText('SimulationCraft addon export')).toHaveValue('complete profile');
    fireEvent.change(screen.getByLabelText('Faction'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Import selected attempt' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'ada-attempt', factionChoice: 2 }),
    );
  });

  it('keeps GUIDs and discovery diagnostics behind an optional disclosure', () => {
    const onStartOver = vi.fn();
    render(
      <TargetDummyImportInput
        request={{
          ...request,
          diagnostics: [{ line: 7, severity: 'warning', message: 'Nearby activity was ignored.' }],
        }}
        disabled={false}
        onSubmit={vi.fn()}
        onStartOver={onStartOver}
      />,
    );

    expect(screen.getByText('Technical discovery details')).toBeInTheDocument();
    expect(screen.getByText(/Player-1; activity score 8/)).toBeInTheDocument();
    expect(screen.getByText('Nearby activity was ignored.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    expect(onStartOver).toHaveBeenCalledOnce();
  });
});
