export interface User {
  id: string;
  nome: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthPayload {
  usuario: User;
  token: string;
}
