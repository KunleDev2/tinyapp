const { assert, use } = require('chai');
const checkIfUserExists = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkIfUserExists("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user[expectedUserID].id, expectedUserID);
  });
  it('should return undefined with invalid email', function() {
    const user = checkIfUserExists("usernnm@example.com", testUsers);

    assert.isUndefined(user);
  });
});