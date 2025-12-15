import { db } from '@/lib/db'

// Database utility functions for RimMed

export class ClinicService {
  static async getClinicById(clinicId: string) {
    return await db.clinic.findUnique({
      where: { id: clinicId, isActive: true }
    })
  }

  static async getClinics() {
    return await db.clinic.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  }
}

export class ProfileService {
  static async getProfileByAuthUserId(authUserId: string) {
    return await db.profile.findUnique({
      where: { authUserId },
      include: {
        clinic: true
      }
    })
  }

  static async getProfileById(profileId: string) {
    return await db.profile.findUnique({
      where: { id: profileId },
      include: {
        clinic: true
      }
    })
  }

  static async getProfilesByClinic(clinicId: string) {
    return await db.profile.findMany({
      where: { clinicId, isActive: true },
      include: {
        clinic: true
      },
      orderBy: { name: 'asc' }
    })
  }
}

export class PatientService {
  static async getPatientById(patientId: string) {
    return await db.patient.findUnique({
      where: { id: patientId, isActive: true }
    })
  }

  static async getPatientsByClinic(clinicId: string, search?: string) {
    const where: any = { clinicId, isActive: true }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    return await db.patient.findMany({
      where,
      orderBy: { name: 'asc' }
    })
  }

  static async createPatient(data: {
    clinicId: string
    name: string
    phoneNumber: string
    email?: string
    dateOfBirth?: Date
    gender?: any
    address?: string
    notes?: string
  }) {
    return await db.patient.create({
      data
    })
  }

  static async updatePatient(patientId: string, data: Partial<any>) {
    return await db.patient.update({
      where: { id: patientId },
      data
    })
  }

  static async findOrCreatePatient(clinicId: string, phoneNumber: string, name: string) {
    let patient = await db.patient.findFirst({
      where: { clinicId, phoneNumber, isActive: true }
    })

    if (!patient) {
      patient = await db.patient.create({
        data: {
          clinicId,
          name,
          phoneNumber
        }
      })
    }

    return patient
  }
}

export class TurnService {
  static async getTurnById(turnId: string) {
    return await db.turn.findUnique({
      where: { id: turnId },
      include: {
        patient: true,
        creator: true,
        updater: true
      }
    })
  }

  static async getTurnsByClinicAndDate(clinicId: string, date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return await db.turn.findMany({
      where: {
        clinicId,
        turnDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        patient: true,
        creator: true,
        updater: true
      },
      orderBy: [
        { isUrgent: 'desc' },
        { queuePosition: 'asc' },
        { createdAt: 'asc' }
      ]
    })
  }

  static async getTodayTurns(clinicId: string) {
    return await this.getTurnsByClinicAndDate(clinicId, new Date())
  }

  static async createTurn(data: {
    clinicId: string
    patientId: string
    isUrgent?: boolean
    scheduledTime?: Date
    serviceType?: string
    createdBy: string
  }) {
    // Get the next queue position for today
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const lastTurn = await db.turn.findFirst({
      where: {
        clinicId: data.clinicId,
        turnDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { queuePosition: 'desc' }
    })

    const nextPosition = lastTurn ? lastTurn.queuePosition + 1 : 1

    return await db.turn.create({
      data: {
        ...data,
        queuePosition: nextPosition,
        turnDate: today
      },
      include: {
        patient: true,
        creator: true
      }
    })
  }

  static async updateTurnStatus(turnId: string, status: any, updatedBy: string, notes?: string) {
    const updateData: any = {
      status,
      updatedBy
    }

    // Add timestamps based on status
    const now = new Date()
    switch (status) {
      case 'WAITING':
        updateData.checkedInAt = now
        break
      case 'NEXT':
        updateData.calledAt = now
        break
      case 'IN_CONSULTATION':
        updateData.consultationStartAt = now
        break
      case 'DONE':
        updateData.consultationEndAt = now
        updateData.completedAt = now
        break
    }

    if (notes) {
      updateData.serviceNotes = notes
    }

    return await db.turn.update({
      where: { id: turnId },
      data: updateData,
      include: {
        patient: true,
        creator: true,
        updater: true
      }
    })
  }

  static async reorderTurns(clinicId: string, turnIds: string[], updatedBy: string) {
    const updates = turnIds.map((turnId, index) => 
      db.turn.update({
        where: { id: turnId },
        data: { 
          queuePosition: index + 1,
          updatedBy
        }
      })
    )

    return await db.$transaction(updates)
  }

  static async getNextInQueue(clinicId: string) {
    return await db.turn.findFirst({
      where: {
        clinicId,
        status: 'WAITING'
      },
      include: {
        patient: true,
        creator: true
      },
      orderBy: [
        { isUrgent: 'desc' },
        { queuePosition: 'asc' }
      ]
    })
  }

  static async getQueueStats(clinicId: string, date: Date = new Date()) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const turns = await db.turn.findMany({
      where: {
        clinicId,
        turnDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    return {
      total: turns.length,
      waiting: turns.filter(t => t.status === 'WAITING').length,
      inConsultation: turns.filter(t => t.status === 'IN_CONSULTATION').length,
      done: turns.filter(t => t.status === 'DONE').length,
      urgent: turns.filter(t => t.isUrgent).length,
      cancelled: turns.filter(t => t.status === 'CANCELLED').length
    }
  }
}

export class NotificationService {
  static async createNotificationEvent(data: {
    clinicId: string
    turnId: string
    eventType: any
    channel: any
    recipient: string
    payload?: any
  }) {
    return await db.notificationEvent.create({
      data
    })
  }

  static async getPendingNotifications(clinicId: string) {
    return await db.notificationEvent.findMany({
      where: {
        clinicId,
        status: 'PENDING'
      },
      include: {
        turn: {
          include: {
            patient: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  }
}

export class AuditService {
  static async logAudit(data: {
    clinicId: string
    userId: string
    action: string
    entity: string
    entityId: string
    oldValues?: any
    newValues?: any
    ipAddress?: string
    userAgent?: string
  }) {
    return await db.auditLog.create({
      data
    })
  }

  static async getAuditLogs(clinicId: string, limit: number = 100) {
    return await db.auditLog.findMany({
      where: { clinicId },
      include: {
        // We can add user relation if needed
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }
}