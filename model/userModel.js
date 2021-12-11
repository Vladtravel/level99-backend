const User = require("../model/schemas/userSchema");

const findAllEmails = async () => {
  const result = await User.find({}, "email");

  return result.flatMap((doc) => doc.email);
};

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const findById = async (id) => {
  return await User.findOne({ _id: id });
};

const findByVerifyTokenEmail = async (token) => {
  return await User.findOne({ verifyToken: token });
};

const create = async (userOptions) => {
  const user = new User(userOptions);
  return await user.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};

const updateAvatar = async (id, avatar, idCloudAvatar = null) => {
  return await User.updateOne({ _id: id }, { avatar, idCloudAvatar });
};

const updateVerifyToken = async (id, verify, verifyToken) => {
  return await User.updateOne(
    { _id: id },
    { verify, verifyToken: verifyToken }
  );
};

module.exports = {
  findAllEmails,
  findByEmail,
  create,
  findById,
  updateToken,
  updateAvatar,
  findByVerifyTokenEmail,
  updateVerifyToken,
};
