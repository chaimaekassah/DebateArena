module.exports = {
  launchImageLibraryAsync: jest.fn(async () => ({
    cancelled: false,
    assets: [{ uri: 'mock-image-uri' }],
  })),
};
