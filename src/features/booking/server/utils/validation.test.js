import { describe, expect, test } from 'vitest'
import { validateBooking } from './validation'

const validBooking = {
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
  addons: [{ addon_id: 1, quantity: 2 }],
  foods: [{ food_id: 1, quantity: 20 }],
}

const validRelatedData = {
  packages: [
    {
      package_id: 'pkg-001',
      package_name: 'Farm Tour',
      package_availability: true,
      minimum_pax: 20,
    },
  ],
  addons: [
    {
      addon_id: 1,
      addon_name: 'Animal Feed',
      addon_avail: true,
    },
  ],
  foods: [{ food_id: 1 }],
}

describe('validateBooking', () => {
  test('accepts a valid booking and related data', () => {
    expect(() => validateBooking(validBooking, validRelatedData)).not.toThrow()
  })

  test('rejects booking with no selected packages', () => {
    expect(() =>
      validateBooking(
        {
          ...validBooking,
          packages: [],
        },
        {
          ...validRelatedData,
          packages: [],
        },
      ),
    ).toThrow('At least one package required')
  })

  test('rejects when selected package count does not match loaded packages', () => {
    expect(() =>
      validateBooking(validBooking, {
        ...validRelatedData,
        packages: [],
      }),
    ).toThrow('Invalid package selection')
  })

  test('rejects unavailable packages', () => {
    expect(() =>
      validateBooking(validBooking, {
        ...validRelatedData,
        packages: [
          {
            ...validRelatedData.packages[0],
            package_availability: false,
          },
        ],
      }),
    ).toThrow('Selected Package is not available: Farm Tour')
  })

  test('rejects bookings below the 20 pax minimum', () => {
    expect(() =>
      validateBooking(
        {
          ...validBooking,
          packages: [
            {
              ...validBooking.packages[0],
              pax_my_adult: 19,
            },
          ],
        },
        validRelatedData,
      ),
    ).toThrow('At least 20 pax needed')
  })

  test('rejects package-specific minimum pax for multi-package bookings', () => {
    const secondPackage = {
      ...validBooking.packages[0],
      package_id: 'pkg-002',
      pax_my_adult: 5,
      pax_my_kid: 0,
    }

    expect(() =>
      validateBooking(
        {
          ...validBooking,
          packages: [
            {
              ...validBooking.packages[0],
              pax_my_adult: 20,
            },
            secondPackage,
          ],
        },
        {
          ...validRelatedData,
          packages: [
            validRelatedData.packages[0],
            {
              package_id: 'pkg-002',
              package_name: 'Workshop',
              package_availability: true,
              minimum_pax: 10,
            },
          ],
        },
      ),
    ).toThrow('Workshop requires at least 10 pax')
  })

  test('rejects invalid food selections', () => {
    expect(() =>
      validateBooking(validBooking, {
        ...validRelatedData,
        foods: [],
      }),
    ).toThrow('Invalid food selection')
  })

  test('rejects invalid add-on selections', () => {
    expect(() =>
      validateBooking(validBooking, {
        ...validRelatedData,
        addons: [],
      }),
    ).toThrow('Invalid Addon')
  })

  test('rejects unavailable add-ons', () => {
    expect(() =>
      validateBooking(validBooking, {
        ...validRelatedData,
        addons: [
          {
            ...validRelatedData.addons[0],
            addon_avail: false,
          },
        ],
      }),
    ).toThrow('Selected addon is not available: Animal Feed')
  })
})
