import jwt, { SignOptions } from "jsonwebtoken";

export const createAccessToken = (
  payload: object,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, { expiresIn });
};
// export const createRefreshToken = (
//   payload: object,
//   secret: string,
//   expiresIn: SignOptions["expiresIn"],
// ) => {
//   return jwt.sign(payload, secret, { expiresIn });
// };
