import type { Step } from "@/lib/booking-form"

type StepIndicatorProps = {
  step: Step
}

export function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className={`rounded-md border px-3 py-2 text-sm ${
            step === item ? "border-black bg-slate-100 font-medium" : "text-slate-500"
          }`}
        >
          Step {item}
        </div>
      ))}
    </div>
  )
}
