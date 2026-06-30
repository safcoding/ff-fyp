import { describe, expect, test } from 'vitest'
import {
  availabilitySchema,
  createBookingSchema,
} from './bookingSchemas'

const validCreateBooking = {
  booking_date: '2026-07-15',
  pic_name: 'Safuan Hakim',
  pic_email: 'safuan@example.com',
  pic_hp: '+60123456789',
  org_address: '123 Jalan Example',
  org_name: 'Example University',
  org_state: 'SELANGOR',
  org_type: 'UNIVERSITY_COLLEGE',
  event_name: 'Farm Visit',
  slot_id: 'MORNING',
  packages: [
    {
      package_id: 'pkg-001',
      selected_activity: 1,
      pax_my_adult: 20,
      pax_my_kid: 0,
      pax_my_senior: 0,
      pax_my_oku: 0,
      pax_non_my_adult: 0,
      pax_non_my_kid: 0,
      pax_non_my_senior: 0,
      pax_non_my_oku: 0,
    },
  ],
  addons: [
    {
      addon_id: 1,
      quantity: 2,
    },
  ],
  foods: [
    {
      food_id: 1,
      quantity: 20,
    },
  ],
}

describe('createBookingSchema', () => {
    test ('accepts a valid booking input', () => {
        const result = createBookingSchema.safeParse(validCreateBooking)

        expect(result.success).toBe(true)
    })
    test ('rejects an invalid email', () => {
        const result = createBookingSchema.safeParse({
            ...validCreateBooking,
            pic_email: 'def-not-email-lmao,'
        })
        expect(result.success).toBe(false)
    })
    test ('reject invalid phone number format', () => {
        const result = createBookingSchema.safeParse({
            ...validCreateBooking,
            pic_hp: 543,
        })
        expect(result.success).toBe(false)
    })
    test('rejects an empty PIC name', () => {
        const result = createBookingSchema.safeParse({
        ...validCreateBooking,
        pic_name: '',
        })

        expect(result.success).toBe(false)
    })

    test('rejects an empty slot id', () => {
        const result = createBookingSchema.safeParse({
        ...validCreateBooking,
        slot_id: '',
        })

        expect(result.success).toBe(false)
    })
    test('reject negative pax user input', () => {
        const result = createBookingSchema.safeParse({
            ...validCreateBooking,
            packages: [
                {
                    ...validCreateBooking.packages[0],
                    pax_my_adult: -5,
                },
            ],
        })
        expect(result.success).toBe(false)
    })
})

describe('availabilitySchema', () => {
  test('accepts a valid month and date', () => {
    const result = availabilitySchema.safeParse({
      month: '2026-07',
      date: '2026-07-15',
    })

    expect(result.success).toBe(true)
  })

  test('rejects invalid month format', () => {
    const result = availabilitySchema.safeParse({
      month: '07-2026',
      date: '2026-07-15',
    })

    expect(result.success).toBe(false)
  })

  test('rejects invalid date format', () => {
    const result = availabilitySchema.safeParse({
      month: '2026-07',
      date: '15-07-2026',
    })

    expect(result.success).toBe(false)
  })
})
