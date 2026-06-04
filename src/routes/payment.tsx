import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CreditCard, Download, ReceiptText } from 'lucide-react'

import { getBookingById } from '@/features/booking/server/bookingActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate } from '@/lib/utils'

export const Route = createFileRoute('/payment')({
  component: PaymentPage,
})

type FakeReceipt = {
  receiptNo: string
  paidAt: Date
  cardLast4: string
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function PaymentPage() {
  const [bookingId, setBookingId] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [receipt, setReceipt] = useState<FakeReceipt | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setBookingId(params.get('booking_id') ?? '')
  }, [])

  const bookingQuery = useQuery({
    queryKey: ['payment-booking', bookingId],
    enabled: Boolean(bookingId),
    queryFn: () => getBookingById({ data: { booking_id: bookingId } }),
  })

  const canSubmit = useMemo(() => {
    return (
      cardName.trim().length > 1 &&
      cardNumber.replace(/\D/g, '').length === 16 &&
      /^\d{2}\/\d{2}$/.test(expiry) &&
      cvc.replace(/\D/g, '').length >= 3
    )
  }, [cardName, cardNumber, cvc, expiry])

  const booking = bookingQuery.data

  function submitFakePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    const digits = cardNumber.replace(/\D/g, '')
    setReceipt({
      receiptNo: `FAKE-${Date.now().toString().slice(-8)}`,
      paidAt: new Date(),
      cardLast4: digits.slice(-4),
    })
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <div className="mb-6 border-b border-[#445412]/10 pb-6">
        <h1 className="font-fraunces text-3xl font-black text-[#445412] sm:text-4xl">
          Booking Payment
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          This is a dummy payment page for local testing only.
        </p>
      </div>

      {!bookingId ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-600">
              Missing booking ID. Please open the payment link from your booking
              approval email.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {bookingQuery.isPending && bookingId ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-stone-600">Loading booking...</p>
          </CardContent>
        </Card>
      ) : null}

      {bookingQuery.isError ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-red-600">
              {bookingQuery.error.message}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {booking ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-[#445412]/10 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#445412]">
                <ReceiptText className="size-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase text-stone-500">
                  Booking ID
                </p>
                <p className="mt-1 font-mono text-sm text-stone-800">
                  {booking.booking_id}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-500">
                    Organization
                  </p>
                  <p className="font-medium text-stone-900">
                    {booking.org_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-500">
                    Booking Date
                  </p>
                  <p className="font-medium text-stone-900">
                    {formatDate(booking.booking_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-500">
                    Package
                  </p>
                  <p className="font-medium text-stone-900">
                    {booking.packages
                      .map((pkg) => pkg.package_name)
                      .join(', ') || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-500">
                    Pax
                  </p>
                  <p className="font-medium text-stone-900">
                    {booking.pax_total}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase text-emerald-700">
                  Amount Due
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-950 sm:text-3xl">
                  {formatCurrency(Number(booking.booking_price))}
                </p>
                {booking.discount_id ? (
                  <p className="mt-1 text-sm text-emerald-700">
                    Discount applied: {booking.discount_id}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#445412]/10 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#445412]">
                {receipt ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <CreditCard className="size-5" />
                )}
                {receipt ? 'Payment Confirmed' : 'Fake Payment Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receipt ? (
                <div className="space-y-4">
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                    <p className="font-semibold">Payment successful</p>
                    <p className="mt-1 text-sm">
                      This fake payment has been confirmed for testing.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-md border p-4 text-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                      <span className="text-stone-500">Receipt No.</span>
                      <span className="font-medium">{receipt.receiptNo}</span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                      <span className="text-stone-500">Paid At</span>
                      <span className="font-medium">
                        {receipt.paidAt.toLocaleString('en-MY')}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                      <span className="text-stone-500">Card</span>
                      <span className="font-medium">
                        Ending {receipt.cardLast4}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                      <span className="text-stone-500">Amount</span>
                      <span className="font-medium">
                        {formatCurrency(Number(booking.booking_price))}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => window.print()}>
                    <Download className="mr-2 size-4" />
                    Print receipt
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={submitFakePayment}>
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Name on Card</Label>
                    <Input
                      id="card-name"
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      placeholder="Test User"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(event) =>
                        setCardNumber(formatCardNumber(event.target.value))
                      }
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        inputMode="numeric"
                        value={expiry}
                        onChange={(event) =>
                          setExpiry(formatExpiry(event.target.value))
                        }
                        placeholder="12/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        inputMode="numeric"
                        value={cvc}
                        onChange={(event) =>
                          setCvc(event.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={!canSubmit}>
                    Pay {formatCurrency(Number(booking.booking_price))}
                  </Button>
                  <p className="text-xs text-stone-500">
                    Use any 16 digits. No payment will be processed.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  )
}
