export type LoginResponse = {
  user: { id: string; name: string; email: string; accessToken: string };
  message?: string;
};
export type SignupResponse = {
  user: { id: string; name: string; email: string };
  message?: string;
};
