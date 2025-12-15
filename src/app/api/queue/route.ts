import { NextRequest, NextResponse } from 'next/server'
import { TurnService, ClinicService, PatientService } from '@/lib/services'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinicId')
    const date = searchParams.get('date')

    if (!clinicId) {
      return NextResponse.json(
        { success: false, error: 'Clinic ID is required' },
        { status: 400 }
      )
    }

    // Get clinic info
    const clinic = await ClinicService.getClinicById(clinicId)
    if (!clinic) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      )
    }

    // Get turns for the specified date (or today if not provided)
    const targetDate = date ? new Date(date) : new Date()
    const turns = await TurnService.getTurnsByClinicAndDate(clinicId, targetDate)
    
    // Get queue stats
    const stats = await TurnService.getQueueStats(clinicId, targetDate)

    return NextResponse.json({
      success: true,
      data: {
        clinic: {
          id: clinic.id,
          name: clinic.name,
          timezone: clinic.timezone
        },
        date: targetDate.toISOString(),
        stats,
        turns: turns.map(turn => ({
          id: turn.id,
          queuePosition: turn.queuePosition,
          status: turn.status,
          isUrgent: turn.isUrgent,
          scheduledTime: turn.scheduledTime,
          checkedInAt: turn.checkedInAt,
          patient: {
            id: turn.patient.id,
            name: turn.patient.name,
            phoneNumber: turn.patient.phoneNumber
          }
        }))
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clinicId, patientId, isUrgent = false, scheduledTime, serviceType, createdBy } = body

    if (!clinicId || !patientId || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify clinic exists
    const clinic = await ClinicService.getClinicById(clinicId)
    if (!clinic) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      )
    }

    // Create the turn
    const turn = await TurnService.createTurn({
      clinicId,
      patientId,
      isUrgent,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      serviceType,
      createdBy
    })

    return NextResponse.json({
      success: true,
      data: {
        id: turn.id,
        queuePosition: turn.queuePosition,
        status: turn.status,
        isUrgent: turn.isUrgent,
        patient: {
          id: turn.patient.id,
          name: turn.patient.name,
          phoneNumber: turn.patient.phoneNumber
        }
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}