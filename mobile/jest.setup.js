jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  registerRootComponent: jest.fn(),
}));
