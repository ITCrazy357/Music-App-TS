export const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateRandomNumber = (lengh: number) => {
  const characters = "0123456789";
  let result = "";
  for (let i = 0; i < lengh; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
