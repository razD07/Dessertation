const request = require('supertest');
const app = require('../index.js'); // Adjust the path to your index.js

describe('API Endpoints', () => {
  beforeEach(() => {
    // Mock database behaviors before each test
    app.database.collection('users').findOne.mockResolvedValue({
      _id: 'someUserId',
      name: 'Raz D',
      email: 'razD@example.com',
    });

    app.database.collection('users').insertOne.mockResolvedValue({
      insertedId: 'someUserId',
    });

    app.database.collection('users').updateOne.mockResolvedValue({
      modifiedCount: 1,
    });
  });

  it('should fetch user data', async () => {
    const userId = 'someUserId';
    const response = await request(app).get(`/api/user/${userId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
  });

  it('should upload a profile photo', async () => {
    const userId = 'someUserId';
    const response = await request(app)
      .post(`/api/user/uploadPhoto/${userId}`)
      .attach('profilePhoto', 'path/to/photo.png');
      
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('profilePhotoUrl');
  });

  it('should update user details', async () => {
    const userId = 'someUserId';
    const userDetails = {
      name: 'Updated Name',
      email: 'updatedemail@example.com',
      phoneNumber: '1234567890',
      address: 'New Address'
    };

    const response = await request(app)
      .put(`/api/user/${userId}`)
      .send(userDetails);

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Updated Name');
    expect(response.body.email).toBe('updatedemail@example.com');
  });
});
