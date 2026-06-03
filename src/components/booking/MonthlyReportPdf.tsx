import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'
import { formatCurrency, formatDate } from '@/lib/utils'

type MonthlyReportBooking = {
  booking_id: string
  booking_price: string
  booking_date: string | Date | null
  booking_status: string | null
  slot_name?: string | null
  slot_id: string
  pax_total: number
  pic_name: string
  org_name: string
  event_name?: string | null
  discount_id?: string | null
  packages: Array<{
    package_id: string
    package_name: string | null
  }>
  booking_addons: Array<{
    addon_id: number
    addon_name: string
    addon_quantity: number
  }>
  booking_foods: Array<{
    food_id: number
    food_name: string
    food_quantity: number
  }>
}

export type MonthlyReportData = {
  month: string
  generated_at: string | Date
  bookings: MonthlyReportBooking[]
  company_name?: string | null
  company_address?: string | null
  company_phone?: string | null
  company_email?: string | null
  sst_registration?: string | null
}

type CountRow = {
  name: string
  count: number
  pax?: number
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    color: '#2f3325',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#d9dec8',
    paddingBottom: 12,
    marginBottom: 14,
  },
  companyName: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  companyText: {
    textAlign: 'center',
    color: '#606654',
  },
  title: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 2,
    textAlign: 'center',
    color: '#606654',
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 6,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#445412',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d9dec8',
    padding: 8,
    backgroundColor: '#fbfcf6',
  },
  summaryLabel: {
    color: '#606654',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  summaryValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#d9dec8',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0e4',
    minHeight: 22,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#f2f5e9',
    borderBottomColor: '#d9dec8',
  },
  cell: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#445412',
  },
  empty: {
    padding: 10,
    color: '#606654',
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 30,
    right: 30,
    bottom: 18,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#edf0e4',
    color: '#777',
    fontSize: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

function formatMonth(month: string) {
  const date = new Date(`${month}-01T00:00:00.000Z`)
  return new Intl.DateTimeFormat('en-MY', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getPackageUsage(bookings: MonthlyReportBooking[]) {
  const usage = new Map<string, CountRow>()

  bookings.forEach((booking) => {
    booking.packages.forEach((pkg) => {
      const name = pkg.package_name ?? pkg.package_id
      const current = usage.get(name) ?? { name, count: 0, pax: 0 }
      current.count += 1
      current.pax = (current.pax ?? 0) + booking.pax_total
      usage.set(name, current)
    })
  })

  return Array.from(usage.values()).sort((a, b) => b.count - a.count)
}

function getStatusCounts(bookings: MonthlyReportBooking[]) {
  const counts = new Map<string, CountRow>()

  bookings.forEach((booking) => {
    const name = booking.booking_status ?? 'UNKNOWN'
    const current = counts.get(name) ?? { name, count: 0 }
    current.count += 1
    counts.set(name, current)
  })

  return Array.from(counts.values()).sort((a, b) => b.count - a.count)
}

function getItemUsage(
  bookings: MonthlyReportBooking[],
  key: 'booking_addons' | 'booking_foods',
) {
  const usage = new Map<string, CountRow>()

  bookings.forEach((booking) => {
    booking[key].forEach((item) => {
      const name =
        key === 'booking_addons'
          ? item.addon_name
          : 'food_name' in item
            ? item.food_name
            : ''
      const quantity =
        key === 'booking_addons'
          ? item.addon_quantity
          : 'food_quantity' in item
            ? item.food_quantity
            : 0
      const current = usage.get(name) ?? { name, count: 0 }
      current.count += quantity
      usage.set(name, current)
    })
  })

  return Array.from(usage.values()).sort((a, b) => b.count - a.count)
}

function CountTable({
  rows,
  countLabel,
  includePax = false,
}: {
  rows: CountRow[]
  countLabel: string
  includePax?: boolean
}) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, { width: includePax ? '55%' : '70%' }]}>
          Name
        </Text>
        <Text style={[styles.cell, styles.headerCell, { width: includePax ? '20%' : '30%', textAlign: 'right' }]}>
          {countLabel}
        </Text>
        {includePax ? (
          <Text style={[styles.cell, styles.headerCell, { width: '25%', textAlign: 'right' }]}>
            Pax
          </Text>
        ) : null}
      </View>
      {rows.length ? (
        rows.map((row) => (
          <View style={styles.row} key={row.name}>
            <Text style={[styles.cell, { width: includePax ? '55%' : '70%' }]}>
              {row.name}
            </Text>
            <Text style={[styles.cell, { width: includePax ? '20%' : '30%', textAlign: 'right' }]}>
              {row.count}
            </Text>
            {includePax ? (
              <Text style={[styles.cell, { width: '25%', textAlign: 'right' }]}>
                {row.pax ?? 0}
              </Text>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No data for this month.</Text>
      )}
    </View>
  )
}

export function MonthlyReportDocument({ report }: { report: MonthlyReportData }) {
  const totalBookings = report.bookings.length
  const totalPax = report.bookings.reduce(
    (sum, booking) => sum + booking.pax_total,
    0,
  )
  const totalRevenue = report.bookings.reduce(
    (sum, booking) => sum + Number(booking.booking_price || 0),
    0,
  )
  const approvedBookings = report.bookings.filter(
    (booking) => booking.booking_status === 'APPROVED',
  ).length
  const packageUsage = getPackageUsage(report.bookings)
  const statusCounts = getStatusCounts(report.bookings)
  const addonUsage = getItemUsage(report.bookings, 'booking_addons')
  const foodUsage = getItemUsage(report.bookings, 'booking_foods')

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {report.company_name ?? 'Monthly Booking Report'}
          </Text>
          {report.sst_registration ? (
            <Text style={styles.companyText}>{report.sst_registration}</Text>
          ) : null}
          {report.company_address ? (
            <Text style={styles.companyText}>{report.company_address}</Text>
          ) : null}
          <Text style={styles.companyText}>
            {report.company_phone ? `Tel: ${report.company_phone}` : ''}
            {report.company_phone && report.company_email ? ' | ' : ''}
            {report.company_email ? `Email: ${report.company_email}` : ''}
          </Text>
          <Text style={styles.title}>Monthly Report</Text>
          <Text style={styles.subtitle}>
            {formatMonth(report.month)} | Generated {formatDate(report.generated_at)}
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Bookings</Text>
            <Text style={styles.summaryValue}>{totalBookings}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Approved</Text>
            <Text style={styles.summaryValue}>{approvedBookings}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Pax</Text>
            <Text style={styles.summaryValue}>{totalPax}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Booking Value</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.twoColumns]}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Package Usage</Text>
            <CountTable rows={packageUsage} countLabel="Bookings" includePax />
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Status Summary</Text>
            <CountTable rows={statusCounts} countLabel="Bookings" />
          </View>
        </View>

        <View style={[styles.section, styles.twoColumns]}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Add-ons Ordered</Text>
            <CountTable rows={addonUsage} countLabel="Qty" />
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Food Ordered</Text>
            <CountTable rows={foodUsage} countLabel="Qty" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell, { width: '13%' }]}>
                Date
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: '22%' }]}>
                Organization
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: '22%' }]}>
                Package
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: '10%', textAlign: 'right' }]}>
                Pax
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: '13%' }]}>
                Status
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: '20%', textAlign: 'right' }]}>
                Value
              </Text>
            </View>
            {report.bookings.length ? (
              report.bookings.map((booking) => (
                <View style={styles.row} key={booking.booking_id} wrap={false}>
                  <Text style={[styles.cell, { width: '13%' }]}>
                    {formatDate(booking.booking_date)}
                  </Text>
                  <Text style={[styles.cell, { width: '22%' }]}>
                    {booking.event_name || booking.org_name}
                  </Text>
                  <Text style={[styles.cell, { width: '22%' }]}>
                    {booking.packages
                      .map((pkg) => pkg.package_name ?? pkg.package_id)
                      .join(', ') || '-'}
                  </Text>
                  <Text style={[styles.cell, { width: '10%', textAlign: 'right' }]}>
                    {booking.pax_total}
                  </Text>
                  <Text style={[styles.cell, { width: '13%' }]}>
                    {booking.booking_status ?? '-'}
                  </Text>
                  <Text style={[styles.cell, { width: '20%', textAlign: 'right' }]}>
                    {formatCurrency(Number(booking.booking_price || 0))}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No bookings found for this month.</Text>
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Monthly booking report</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}

export async function buildMonthlyReportPdfBlob(report: MonthlyReportData) {
  const instance = pdf(<MonthlyReportDocument report={report} />)
  return instance.toBlob()
}
