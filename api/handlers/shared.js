exports.displayName = (profile) => {
  return `${profile.firstName} ${profile.lastName.charAt(0)}.`;
};

exports.pseudo = (profile) => {
  return `${profile.firstName.substring(0, 6)}${profile.lastName.charAt(0)}`;
};
