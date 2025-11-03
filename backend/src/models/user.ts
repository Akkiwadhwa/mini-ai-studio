export interface UserRecord {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface UserPayload {
  email: string;
  passwordHash: string;
  createdAt: string;
}
