

const quotationStyles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  section: { marginTop: 12, marginBottom: 6, fontSize: 11, fontWeight: 'bold' },
  row: { marginBottom: 4 },
  muted: { color: '#4b5563' },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  col: { flexGrow: 1 },
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 2,
  }).format(value)
}



function QuotationDocument({ booking }: { booking: QuotationBookingData }) {
  const total = Number(booking.booking_price)

  return (
    <Document>
      <Page size="A4" style={quotationStyles.page}>
        <Text style={quotationStyles.title}>Booking Quotation</Text>
        <Text style={quotationStyles.row}>
          Quotation Date: {formatDate(new Date())}
        </Text>
        <Text style={quotationStyles.row}>
          Booking ID: {booking.booking_id}
        </Text>

        <Text style={quotationStyles.section}>Customer</Text>
        <Text style={quotationStyles.row}>Name: {booking.pic_name}</Text>
        <Text style={quotationStyles.row}>Email: {booking.pic_email}</Text>
        <Text style={quotationStyles.row}>Phone: {booking.pic_hp}</Text>

        <Text style={quotationStyles.section}>Organization</Text>
        <Text style={quotationStyles.row}>Name: {booking.org_name}</Text>
        <Text style={quotationStyles.row}>Type: {booking.org_type}</Text>
        <Text style={quotationStyles.row}>State: {booking.org_state}</Text>
        <Text style={quotationStyles.row}>Address: {booking.org_address}</Text>

        <Text style={quotationStyles.section}>Booking Summary</Text>
        <View style={quotationStyles.twoCol}>
          <View style={quotationStyles.col}>
            <Text style={quotationStyles.row}>
              Booking Date: {formatDate(booking.booking_date)}
            </Text>
            <Text style={quotationStyles.row}>Slot: {booking.slot_id}</Text>
            <Text style={quotationStyles.row}>
              Tour Guides:{' '}
              {booking.slot_type === 'GUIDED'
                ? (booking.assigned_guide_count ?? '-')
                : 'Not required'}
            </Text>
            <Text style={quotationStyles.row}>
              Package: {booking.package_id}
            </Text>
          </View>
          <View style={quotationStyles.col}>
            <Text style={quotationStyles.row}>
              Total: {formatCurrency(total)}
            </Text>
            <Text style={[quotationStyles.row, quotationStyles.muted]}>
              Includes add-ons and foods.
            </Text>
          </View>
        </View>

        <Text style={quotationStyles.section}>Visitors</Text>
        <Text style={quotationStyles.row}>
          MY Adult: {booking.pax_my_adult}
        </Text>
        <Text style={quotationStyles.row}>MY Kid: {booking.pax_my_kid}</Text>
        <Text style={quotationStyles.row}>
          MY Senior: {booking.pax_my_senior}
        </Text>
        <Text style={quotationStyles.row}>MY OKU: {booking.pax_my_oku}</Text>
        <Text style={quotationStyles.row}>
          Non-MY Adult: {booking.pax_non_my_adult}
        </Text>
        <Text style={quotationStyles.row}>
          Non-MY Kid: {booking.pax_non_my_kid}
        </Text>
        <Text style={quotationStyles.row}>
          Non-MY Senior: {booking.pax_non_my_senior}
        </Text>
        <Text style={quotationStyles.row}>
          Non-MY OKU: {booking.pax_non_my_oku}
        </Text>

        <Text style={quotationStyles.section}>Add-ons</Text>
        {booking.booking_addons.length ? (
          booking.booking_addons.map((addon) => (
            <Text key={`addon-${addon.addon_id}`} style={quotationStyles.row}>
              {addon.addon_name} x {addon.addon_quantity}
            </Text>
          ))
        ) : (
          <Text style={[quotationStyles.row, quotationStyles.muted]}>
            No add-ons selected.
          </Text>
        )}

        <Text style={quotationStyles.section}>Foods</Text>
        {booking.booking_foods.length ? (
          booking.booking_foods.map((food) => (
            <Text key={`food-${food.food_id}`} style={quotationStyles.row}>
              {food.food_name} x {food.food_quantity}
            </Text>
          ))
        ) : (
          <Text style={[quotationStyles.row, quotationStyles.muted]}>
            No foods selected.
          </Text>
        )}
      </Page>
    </Document>
  )
}
*/