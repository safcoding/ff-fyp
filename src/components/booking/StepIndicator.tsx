import type { Step } from "@/lib/utils/booking/booking-form"

type StepIndicatorProps = {
  step: Step
}

export function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="grid grid-cols-5 gap-1 rounded-md bg-white/35 p-1 sm:gap-2">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className={`rounded-md border px-2 py-2 text-center text-xs font-medium sm:px-3 sm:text-sm ${
            step === item
              ? "border-[#445412] bg-white text-[#445412] shadow-sm"
              : "border-transparent text-stone-500"
          }`}
        >
          <span className="hidden sm:inline">Step </span>
          {item}
        </div>
      ))}
    </div>
  )
}
