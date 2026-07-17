import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function compare(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
