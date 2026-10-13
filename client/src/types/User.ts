export type LoginResponse = {
  user: { name: string; email: string; accessToken: string };
  message?: string;
};
