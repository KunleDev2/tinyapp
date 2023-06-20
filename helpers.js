const checkIfUserExists = (email, usersDatabase) => {
  let isUserExisting = {};

  for (let key in usersDatabase) {
    const userEmail = usersDatabase[key].email;
    
    if (email === userEmail) {
      isUserExisting[key] = usersDatabase[key];

      return isUserExisting;
    }
  }

  return undefined;
};

const generateRandomString = () => {
  let getRandChar = '';
  let randArray = [];
  let charForRand = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const maxLength = 6;

  for (let i = 0; i < maxLength; i++) {
    let genRandomChar = Math.floor(Math.random() * charForRand.length);

    getRandChar = getRandChar + charForRand.charAt(genRandomChar);

    randArray.push(getRandChar);
  }

  return getRandChar;
};

const urlsForUser = (id, idParam, urlDatabase) => {
  const idOne = urlDatabase[idParam];
  const idTwo = id;

  if (idOne) {
    if (idOne.userId === idTwo) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const exportHelpers = {
  checkIfUserExists,
  generateRandomString,
  urlsForUser
}

module.exports = exportHelpers;