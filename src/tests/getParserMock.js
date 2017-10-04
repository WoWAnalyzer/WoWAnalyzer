export default function getParserMock() {
  return {
    toPlayer: jest.fn(() => true),
    byPlayer: jest.fn(() => true),
    toPlayerPet: jest.fn(() => true),
    byPlayerPet: jest.fn(() => true),
    triggerEvent: jest.fn(),
    currentTimestamp: 0,
  };
}
