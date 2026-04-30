const formatOwnUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  bio: user.bio,
  profile_picture_url: user.profile_picture_url,
  primary_contact_number: user.primary_contact_number,
});


export default formatOwnUser;
