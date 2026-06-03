import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'
import { formatCurrency, formatDate } from '@/lib/utils'
import { GUIDE_PRICE } from '@/features/booking/utils/guide-assignment'

type QuotationLineItem = {
  desc: string
  qty: number
  uom: string
  price: number
  total: number
}

export type QuotationBookingData = {
  booking_id: string
  booking_price: string
  assigned_guide_count?: number | null
  booking_date: string | Date | null
  discount_id?: string | null
  discount_type?: string | null
  discount_amount?: number | null
  slot_id: string
  slot_type?: string | null
  package_id: string
  event_name?: string | null
  pic_name: string
  pic_email: string
  pic_hp: string
  org_address: string
  org_name: string
  org_state: string
  org_type: string
  pax_my_adult: number
  pax_my_kid: number
  pax_my_senior: number
  pax_my_oku: number
  pax_non_my_adult: number
  pax_non_my_kid: number
  pax_non_my_senior: number
  pax_non_my_oku: number
  packages: Array<{
    package_id: string
    package_name: string | null
    pax_my_adult: number
    pax_my_kid: number
    pax_my_senior: number
    pax_my_oku: number
    pax_non_my_adult: number
    pax_non_my_kid: number
    pax_non_my_senior: number
    pax_non_my_oku: number
    price_my_adult: number
    price_my_kid: number
    price_my_senior: number
    price_my_oku: number
    price_non_my_adult: number
    price_non_my_kid: number
    price_non_my_senior: number
    price_non_my_oku: number
    subtotal: number | null
  }>
  booking_addons: Array<{
    addon_id: number
    addon_name: string
    addon_quantity: number
    price?: number
  }>
  booking_foods: Array<{
    food_id: number
    food_name: string
    food_quantity: number
    price?: number
  }>
  company_name?: string | null
  company_address?: string | null
  company_phone?: string | null
  company_email?: string | null
  sst_registration?: string | null
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: '#333',
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  companyText: {
    textAlign: 'center',
    fontSize: 9,
    color: '#444',
  },
  quotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quotationTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  quotationNumber: {
    width: '30%',
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Client info section
  billingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  clientBox: {
    width: '50%',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#555',
    marginBottom: 4,
  },
  clientName: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 2,
  },

  // Table Grid Styles
  table: {
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 6,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontWeight: 'bold',
  },
  // Table columns widths mapping
  colItem: { width: '8%', textAlign: 'center' },
  colDesc: { width: '32%', paddingLeft: 4 },
  colQty: { width: '12%', textAlign: 'center' },
  colUom: { width: '10%', textAlign: 'center' },
  colPrice: { width: '19%', textAlign: 'right' },
  colTotal: { width: '19%', textAlign: 'right', paddingRight: 4 },
  headerText: {
    fontWeight: 'bold',
  },

  // Summary layout
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  summaryBox: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 4,
    paddingTop: 4,
  },
  noteBlock: {
    marginTop: 16,
    fontSize: 8,
    color: '#555',
  },
  footerNote: {
    marginTop: 8,
    fontSize: 8,
    color: '#777',
  },
})

export const QuotationDocument = ({
  booking,
}: {
  booking: QuotationBookingData
}) => {
  const companyName = booking.company_name
  const companyAddress = booking.company_address
  const companyPhone = booking.company_phone
  const companyEmail = booking.company_email
  const sstRegistration = booking.sst_registration
  const contactName = booking.event_name?.trim() || booking.org_name
  const generatedDate = formatDate(new Date())

  const getLineItems = () => {
    const items: QuotationLineItem[] = []

    const paxLineMeta = [
      {
        label: 'ADULTS (MALAYSIAN)',
        paxKey: 'pax_my_adult',
        priceKey: 'price_my_adult',
      },
      {
        label: 'CHILD 4-12 YO (MALAYSIAN)',
        paxKey: 'pax_my_kid',
        priceKey: 'price_my_kid',
      },
      {
        label: 'SENIOR (MALAYSIAN)',
        paxKey: 'pax_my_senior',
        priceKey: 'price_my_senior',
      },
      {
        label: 'OKU (MALAYSIAN)',
        paxKey: 'pax_my_oku',
        priceKey: 'price_my_oku',
      },
      {
        label: 'ADULTS (NON-MALAYSIAN)',
        paxKey: 'pax_non_my_adult',
        priceKey: 'price_non_my_adult',
      },
      {
        label: 'CHILD 4-12 YO (NON-MALAYSIAN)',
        paxKey: 'pax_non_my_kid',
        priceKey: 'price_non_my_kid',
      },
      {
        label: 'SENIOR (NON-MALAYSIAN)',
        paxKey: 'pax_non_my_senior',
        priceKey: 'price_non_my_senior',
      },
      {
        label: 'OKU (NON-MALAYSIAN)',
        paxKey: 'pax_non_my_oku',
        priceKey: 'price_non_my_oku',
      },
    ] as const

    booking.packages.forEach((pkg) => {
      const packageName = pkg.package_name ?? pkg.package_id

      paxLineMeta.forEach((meta) => {
        const qty = Number(pkg[meta.paxKey] ?? 0)
        const price = Number(pkg[meta.priceKey] ?? 0)

        if (qty <= 0) {
          return
        }

        items.push({
          desc: `${meta.label} - ${packageName}`,
          qty,
          uom: 'PAX',
          price,
          total: qty * price,
        })
      })
    })

    if (booking.booking_addons && booking.booking_addons.length) {
      booking.booking_addons.forEach((addon) => {
        items.push({
          desc: addon.addon_name,
          qty: addon.addon_quantity,
          uom: 'UNIT',
          price: addon.price || 0,
          total: addon.addon_quantity * (addon.price || 0),
        })
      })
    }

    if (booking.booking_foods && booking.booking_foods.length) {
      booking.booking_foods.forEach((food) => {
        items.push({
          desc: food.food_name,
          qty: food.food_quantity,
          uom: 'SET',
          price: food.price || 0,
          total: food.food_quantity * (food.price || 0),
        })
      })
    }

    if ((booking.assigned_guide_count ?? 0) > 0) {
      const guideCount = booking.assigned_guide_count ?? 0

      items.push({
        desc: 'TOUR GUIDE',
        qty: guideCount,
        uom: 'GUIDE',
        price: GUIDE_PRICE,
        total: guideCount * GUIDE_PRICE,
      })
    }

    return items
  }

  const lineItems = getLineItems()
  const subtotal = lineItems.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  )
  const total = Number(booking.booking_price || 0)
  const discountValue = Math.max(subtotal - total, 0)
  const hasDiscount = Boolean(booking.discount_id) || discountValue > 0
  const grandTotal = total

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.companyText}>{sstRegistration}</Text>
          <Text style={styles.companyText}>{companyAddress}</Text>
          <Text style={styles.companyText}>
            Tel: {companyPhone} | Email: {companyEmail}
          </Text>
        </View>

        <View style={styles.quotationRow}>
          <Text style={{ width: '30%' }} />
          <Text style={styles.quotationTitle}>Quotation</Text>
          <Text style={styles.quotationNumber}>No. {booking.booking_id}</Text>
        </View>

        {/* 2. BILLING / CLIENT SECTION */}
        <View style={styles.billingContainer}>
          <View style={styles.clientBox}>
            <Text style={styles.sectionTitle}>To:</Text>
            <Text style={styles.clientName}>{contactName}</Text>
            {booking.org_address && <Text>{booking.org_address}</Text>}
            {booking.org_state && <Text>{booking.org_state}</Text>}
          </View>

          <View style={styles.clientBox}>
            <Text style={styles.sectionTitle}>Person in charge</Text>
            <Text>{booking.pic_name}</Text>
            <Text>Tel: {booking.pic_hp}</Text>
            <Text>Email: {booking.pic_email}</Text>
            <Text>Date: {generatedDate}</Text>
            <Text>Page: 1 of 1</Text>
          </View>
        </View>

        {/* 3. ITEMIZED DATA TABLE */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.colItem, styles.headerText]}>Items</Text>
            <Text style={[styles.colDesc, styles.headerText]}>Description</Text>
            <Text style={[styles.colQty, styles.headerText]}>Quantity</Text>
            <Text style={[styles.colUom, styles.headerText]}>UOM</Text>
            <Text style={[styles.colPrice, styles.headerText]}>
              Unit per price
            </Text>
            <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
          </View>

          {/* Table Body (Dynamic Lines) */}
          {lineItems.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.colItem}>{index + 1}</Text>
              <Text style={styles.colDesc}>{item.desc}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colUom}>{item.uom}</Text>
              <Text style={styles.colPrice}>
                {Number(item.price).toFixed(2)}
              </Text>
              <Text style={styles.colTotal}>
                {Number(item.total).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* 4. SUMMARY FOOTER FINANCIALS */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price before discount:</Text>
              <Text>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Discount{booking.discount_id ? ` (${booking.discount_id})` : ''}:
              </Text>
              <Text>
                {hasDiscount ? `- ${formatCurrency(discountValue)}` : '-'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price after discount:</Text>
              <Text>{formatCurrency(total)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, { fontSize: 10 }]}>
                Grand Total:
              </Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                {formatCurrency(grandTotal)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.noteBlock}>Note: (to be added)</Text>
        <Text style={styles.footerNote}>
          This quotation is computer generated and does not require a signature.
        </Text>
      </Page>
    </Document>
  )
}

export async function buildQuotationPdfBlob(booking: QuotationBookingData) {
  const instance = pdf(<QuotationDocument booking={booking} />)
  return instance.toBlob()
}
