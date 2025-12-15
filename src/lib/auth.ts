import { ProfileService } from '@/lib/services'
import type { Profile, UserRole } from '@/lib/types'

// Mock authentication for development
// In production, this would integrate with NextAuth.js or similar

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  clinicId: string
  clinicName: string
}

class AuthService {
  private static currentUser: AuthUser | null = null

  // Mock authentication - replace with real auth system
  static async signIn(email: string, password: string): Promise<AuthUser> {
    // For demo purposes, create a mock user
    // In production, this would validate against real auth system
    
    const mockProfile = await ProfileService.getProfileByAuthUserId('demo-user')
    if (!mockProfile) {
      throw new Error('User not found')
    }

    const user: AuthUser = {
      id: mockProfile.id,
      email: mockProfile.email,
      name: mockProfile.name,
      role: mockProfile.role as UserRole,
      clinicId: mockProfile.clinicId,
      clinicName: mockProfile.clinic?.name || 'Unknown Clinic'
    }

    this.currentUser = user
    localStorage.setItem('rimmed_user', JSON.stringify(user))
    
    return user
  }

  static async signOut(): Promise<void> {
    this.currentUser = null
    localStorage.removeItem('rimmed_user')
  }

  static getCurrentUser(): AuthUser | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Check localStorage for persisted user
    const stored = localStorage.getItem('rimmed_user')
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored)
        return this.currentUser
      } catch {
        localStorage.removeItem('rimmed_user')
      }
    }

    return null
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  static hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser()
    return user ? roles.includes(user.role) : false
  }

  static canManageQueue(): boolean {
    return this.hasAnyRole(['ADMIN', 'RECEPTIONIST'])
  }

  static canViewConsultation(): boolean {
    return this.hasAnyRole(['ADMIN', 'DOCTOR', 'RECEPTIONIST'])
  }

  static canManagePatients(): boolean {
    return this.hasAnyRole(['ADMIN', 'RECEPTIONIST'])
  }

  static canManageSettings(): boolean {
    return this.hasRole('ADMIN')
  }
}

export { AuthService }