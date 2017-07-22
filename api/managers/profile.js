const displayName = (profile) => {
  return `${profile.firstName} ${profile.lastName.charAt(0)}.`;
};

const formatProfile = (profile) => {
  profile.displayName = displayName(profile);
  delete profile.firstName;
  delete profile.lastName;
  const ageDate = new Date(Date.now() - new Date(profile.birthdate).getTime());
  profile.age = Math.abs(ageDate.getUTCFullYear() - 1970);
  delete profile.birthdate;
  profile.hasAvatar = profile._fsId !== null;
  delete profile._fsId;
};

const pseudo = (profile) => {
  return `${profile.firstName.substring(0, 6)}${profile.lastName.charAt(0)}`;
};


module.exports = { formatProfile, displayName, pseudo };
