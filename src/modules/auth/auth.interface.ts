

export interface JwtPayload {
  id: string;
  email: string;
  role: "ADMIN" | "LANDLORD" | "TENANT";
}
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
}
export interface LoginUserPayload {
  email: string;
  password: string;
}