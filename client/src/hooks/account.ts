import { useMutation } from "@tanstack/react-query";
import { createAdmin } from "@/api/admins";
import { createUser } from "@/api/users";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Admin, AdminCreate } from "@/api/admins";
import type { User, UserCreate } from "@/api/users";

export function useCreateAdmin(): UseMutationResult<Admin, Error, AdminCreate> {
  return useMutation({
    mutationFn: (body) => createAdmin(body),
  });
}

export function useCreateUser(): UseMutationResult<User, Error, UserCreate> {
  return useMutation({
    mutationFn: (body) => createUser(body),
  });
}
