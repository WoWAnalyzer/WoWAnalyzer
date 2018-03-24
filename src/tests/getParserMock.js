export default function getParserMock() {
  return {
    toPlayer: jest.fn(() => true),
    byPlayer: jest.fn(() => true),
    toPlayerPet: jest.fn(() => true),
    byPlayerPet: jest.fn(() => true),
    triggerEvent: jest.fn(),
    fabricateEvent: jest.fn(),
    currentTimestamp: 0,
    fight: {
      start_time: 0,
    },
    playerId: 1,
  };
}
