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

module.exports = checkIfUserExists;