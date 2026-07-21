import jwt, { JwtPayload, SignOptions,Secret } from "jsonwebtoken";

export const createAccessToken = (
  payload: object,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, { expiresIn });
};
export const verifyToken = (
  token: string,
  secret: Secret
): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
