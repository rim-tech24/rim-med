import type { UserRole } from '@/lib/types'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  clinicId: string
  clinicName: string
}

/**
 * Auth simple para DEV (sin localStorage, sin SSR issues).
 * Más adelante lo conectamos a auth real + BD.
 */
class AuthService {
  private static currentUser: AuthUser | null = null

  // Usuario fijo para desarrollo
  private static demoUser: AuthUser = {
    id: 'demo-user',
    email: 'demo@rimmed.ma',
    name: 'Admin RimMed',
    role: 'ADMIN',
    clinicId: 'rimmed-clinic',
    clinicName: 'RimMed Clinic'
  }

  static async signIn(_email?: string, _password?: string): Promise<AuthUser> {
    // En DEV, siempre “logueamos” como Admin
    this.currentUser = this.demoUser
    return this.demoUser
  }

  static async signOut(): Promise<void> {
    this.currentUser = null
  }

  static getCurrentUser(): AuthUser {
    // Siempre devolvemos un usuario válido para evitar pantallas “Please sign in”
    return this.currentUser ?? this.demoUser
  }

  static isAuthenticated(): boolean {
    return true
  }

  static hasRole(_role: UserRole): boolean {
    return true
  }

  static hasAnyRole(_roles: UserRole[]): boolean {
    return true
  }

  static canManageQueue(): boolean {
    return true
  }

  static canViewConsultation(): boolean {
    return true
  }

  static canManagePatients(): boolean {
    return true
  }

  static canManageSettings(): boolean {
    return true
  }
}

export { AuthService }
