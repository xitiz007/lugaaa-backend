function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function verifyPassword(password) {
  return password.length >= 8;
}
function comparePassword(password1, password2) {
  return password1 === password2 && verifyPassword(password1);
}

function numberCheck(number) {
  return /^\d{10}$/.test(number);
}

function hasData(text) {
  return text.trim() !== "";
}

function hasCountryCode(code) {
  return /^\d{2,3}$/.test(code);
}

module.exports.validateForm = function validateForm(
  fname,
  lname,
  email,
  number,
  code,
  password1,
  password2
) {
  if (!hasData(fname)) {
    throw new Error("first name must be passed");
  } else if (!hasData(lname)) {
    throw new Error("last name must be passed");
  } else if (!validateEmail(email)) {
    throw new Error("email given is invalid");
  } else if (!hasCountryCode(code)) {
    throw new Error("country code is invalid");
  } else if (!numberCheck(number)) {
    throw new Error("phone number must be of 10 digit");
  } else if (!comparePassword(password1, password2)) {
    throw new Error(
      "password and confirm password must be same and have atleast 8 characters"
    );
  }
  return;
};

module.exports.validateLogin = function validateLogin(email, password) {
  if (!validateEmail(email)) {
    throw new Error("email given is invalid");
  } else if (!verifyPassword(password)) {
    throw new Error("password must be altleast 8 characters");
  }
  return;
}

module.exports.validateUpdateProfile = function validateUpdateProfile(
  changePassword,
  fname,
  lname,
  code,
  phoneNumber,
  currentPassword,
  newPassword,
  confirmNewPassword
) {
  if (!hasData(fname) || !hasData(lname)) {
    throw new Error("first name and last name field cannot be left empty");
  } else if (!hasCountryCode(code)) {
    throw new Error("country code is invalid");
  } else if (!numberCheck(phoneNumber)) {
    throw new Error("phone number must be of 10 digit");
  } else if (
    changePassword &&
    !comparePassword(newPassword, confirmNewPassword)
  ) {
    throw new Error(
      "new password and confirm new password must have atleast 8 characters & match"
    );
  } else if (changePassword && !verifyPassword(currentPassword)) {
    throw new Error("password must have atleast 8 characters");
  }
  return;
}

module.exports.validateProduct = function validateProduct(
  title,
  description,
  category,
  images,
  editProduct = false
) {
  if (!hasData(title)) {
    throw new Error("product title cannot be left empty");
  } else if (!hasData(description)) {
    throw new Error("product description cannot be left empty");
  } else if (!hasData(category)) {
    throw new Error("category cannot be left empty");
  } else if (images.length === 0 && !editProduct) {
    throw new Error("product images must be selected");
  }
  return;
};
