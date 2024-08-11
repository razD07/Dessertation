jest.mock('../index.js', () => {
    const actualApp = jest.requireActual('../index.js');
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
      })),
    };
  
    actualApp.database = mockDb;
    return actualApp;
  });
  