export type Role = 'USER' | 'MODERATOR' | 'ADMIN';

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: Role;
  createdDate?: string;
  updatedDate?: string;
}

export interface UserPreference {
  userPreferenceId?: number;
  userId?: number;
  preferenceKey: string;
  preferenceValue: string;
}
