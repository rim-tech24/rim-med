import { PrismaClient } from '@prisma/client'
import { AuthService } from '@/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a demo clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: 'demo-clinic' },
    update: {},
    create: {
      id: 'demo-clinic',
      name: 'RimMed Demo Clinic',
      address: '123 Avenue Mohammed V, Casablanca, Morocco',
      phone: '+212 522 123 456',
      email: 'info@rimmed.ma',
      timezone: 'Africa/Casablanca',
    },
  })

  console.log('✅ Created clinic:', clinic.name)

  // Create demo users
  const adminProfile = await prisma.profile.upsert({
    where: { authUserId: 'admin-user' },
    update: {},
    create: {
      id: 'admin-profile',
      authUserId: 'admin-user',
      clinicId: clinic.id,
      email: 'admin@rimmed.ma',
      name: 'Dr. Admin',
      phone: '+212 600 000 001',
      role: 'ADMIN',
    },
  })

  const receptionistProfile = await prisma.profile.upsert({
    where: { authUserId: 'receptionist-user' },
    update: {},
    create: {
      id: 'receptionist-profile',
      authUserId: 'receptionist-user',
      clinicId: clinic.id,
      email: 'reception@rimmed.ma',
      name: 'Fatima Reception',
      phone: '+212 600 000 002',
      role: 'RECEPTIONIST',
    },
  })

  const doctorProfile = await prisma.profile.upsert({
    where: { authUserId: 'doctor-user' },
    update: {},
    create: {
      id: 'doctor-profile',
      authUserId: 'doctor-user',
      clinicId: clinic.id,
      email: 'doctor@rimmed.ma',
      name: 'Dr. Mohammed',
      phone: '+212 600 000 003',
      role: 'DOCTOR',
    },
  })

  console.log('✅ Created users')

  // Create demo patients
  const patients = [
    {
      id: 'patient-1',
      name: 'Ahmed Benali',
      phoneNumber: '+212 600 111 222',
      email: 'ahmed@email.com',
      gender: 'MALE' as const,
    },
    {
      id: 'patient-2',
      name: 'Fatima Zahra',
      phoneNumber: '+212 600 333 444',
      email: 'fatima@email.com',
      gender: 'FEMALE' as const,
    },
    {
      id: 'patient-3',
      name: 'Youssef Amrani',
      phoneNumber: '+212 600 555 666',
      gender: 'MALE' as const,
    },
    {
      id: 'patient-4',
      name: 'Aicha Alami',
      phoneNumber: '+212 600 777 888',
      email: 'aicha@email.com',
      gender: 'FEMALE' as const,
    },
    {
      id: 'patient-5',
      name: 'Omar Karim',
      phoneNumber: '+212 600 999 000',
      gender: 'MALE' as const,
    },
  ]

  for (const patientData of patients) {
    await prisma.patient.upsert({
      where: { id: patientData.id },
      update: {},
      create: {
        ...patientData,
        clinicId: clinic.id,
      },
    })
  }

  console.log('✅ Created patients')

  // Create demo turns for today
  const today = new Date()
  const turns = [
    {
      id: 'turn-1',
      patientId: 'patient-1',
      queuePosition: 1,
      status: 'WAITING' as const,
      isUrgent: false,
      checkedInAt: new Date(today.getTime() - 30 * 60000), // 30 minutes ago
    },
    {
      id: 'turn-2',
      patientId: 'patient-2',
      queuePosition: 2,
      status: 'NEXT' as const,
      isUrgent: true,
      checkedInAt: new Date(today.getTime() - 45 * 60000), // 45 minutes ago
      calledAt: new Date(today.getTime() - 5 * 60000), // 5 minutes ago
    },
    {
      id: 'turn-3',
      patientId: 'patient-3',
      queuePosition: 3,
      status: 'WAITING' as const,
      isUrgent: false,
      checkedInAt: new Date(today.getTime() - 60 * 60000), // 1 hour ago
    },
    {
      id: 'turn-4',
      patientId: 'patient-4',
      queuePosition: 4,
      status: 'IN_CONSULTATION' as const,
      isUrgent: false,
      checkedInAt: new Date(today.getTime() - 90 * 60000), // 1.5 hours ago
      consultationStartAt: new Date(today.getTime() - 15 * 60000), // 15 minutes ago
    },
    {
      id: 'turn-5',
      patientId: 'patient-5',
      queuePosition: 5,
      status: 'DONE' as const,
      isUrgent: false,
      checkedInAt: new Date(today.getTime() - 120 * 60000), // 2 hours ago
      consultationStartAt: new Date(today.getTime() - 60 * 60000), // 1 hour ago
      consultationEndAt: new Date(today.getTime() - 30 * 60000), // 30 minutes ago
      completedAt: new Date(today.getTime() - 30 * 60000), // 30 minutes ago
      serviceType: 'General Consultation',
      servicePrice: 150.0,
    },
  ]

  for (const turnData of turns) {
    await prisma.turn.upsert({
      where: { id: turnData.id },
      update: {},
      create: {
        ...turnData,
        clinicId: clinic.id,
        turnDate: today,
        createdBy: receptionistProfile.id,
      },
    })
  }

  console.log('✅ Created demo turns')

  // Create some notification events (for future WhatsApp integration)
  const notificationEvents = [
    {
      id: 'notif-1',
      turnId: 'turn-2',
      eventType: 'TURN_NEXT' as const,
      channel: 'WHATSAPP' as const,
      recipient: '+212 600 333 444',
      status: 'SENT' as const,
      sentAt: new Date(today.getTime() - 5 * 60000),
      payload: {
        message: 'Hello Fatima Zahra, you are next in queue at RimMed Demo Clinic. Please come to the consultation room.',
        patientName: 'Fatima Zahra',
        clinicName: 'RimMed Demo Clinic',
      },
    },
    {
      id: 'notif-2',
      turnId: 'turn-5',
      eventType: 'TURN_DONE' as const,
      channel: 'WHATSAPP' as const,
      recipient: '+212 600 999 000',
      status: 'SENT' as const,
      sentAt: new Date(today.getTime() - 30 * 60000),
      payload: {
        message: 'Thank you for visiting RimMed Demo Clinic. Your consultation is complete.',
        patientName: 'Omar Karim',
        clinicName: 'RimMed Demo Clinic',
      },
    },
  ]

  for (const notifData of notificationEvents) {
    await prisma.notificationEvent.upsert({
      where: { id: notifData.id },
      update: {},
      create: {
        ...notifData,
        clinicId: clinic.id,
      },
    })
  }

  console.log('✅ Created notification events')

  // Create audit logs
  const auditLogs = [
    {
      id: 'audit-1',
      userId: receptionistProfile.id,
      action: 'CREATE',
      entity: 'TURN',
      entityId: 'turn-1',
      newValues: {
        patientId: 'patient-1',
        status: 'SCHEDULED',
        isUrgent: false,
      },
    },
    {
      id: 'audit-2',
      userId: receptionistProfile.id,
      action: 'UPDATE',
      entity: 'TURN',
      entityId: 'turn-1',
      oldValues: { status: 'SCHEDULED' },
      newValues: { status: 'WAITING', checkedInAt: new Date(today.getTime() - 30 * 60000) },
    },
  ]

  for (const auditData of auditLogs) {
    await prisma.auditLog.upsert({
      where: { id: auditData.id },
      update: {},
      create: {
        ...auditData,
        clinicId: clinic.id,
      },
    })
  }

  console.log('✅ Created audit logs')
  console.log('🎉 Database seeding completed!')
  console.log('')
  console.log('Demo Credentials:')
  console.log('Admin: admin@rimmed.ma / demo123')
  console.log('Receptionist: reception@rimmed.ma / demo123')
  console.log('Doctor: doctor@rimmed.ma / demo123')
  console.log('')
  console.log('The system will auto-login as admin for demo purposes.')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })