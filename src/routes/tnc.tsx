import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tnc')({
  component: RouteComponent,
})

function RouteComponent() {
return (
    <main className="w-screen min-h-screen bg-[#fbf0d8] text-gray-800 font-sans pb-24">
      
      <header className="bg-[#445412] text-[#fbf0d8] py-16 px-6 text-center w-full shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-fraunces font-black text-4xl md:text-5xl tracking-wide uppercase border-b-4 border-[#fbf0d8]/30 pb-4 inline-block">
            Terms & Conditions
          </h1>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 mt-12 flex flex-col gap-10 leading-relaxed text-sm md:text-base text-gray-700">  
        <section className="bg-white/40 p-6 md:p-8 rounded-2xl border border-[#445412]/10 flex flex-col gap-4">
          <ul className="list-disc list-outside pl-5 space-y-3">
            <li>
              Farm Fresh @ UPM is solely operated by Farm Fresh Agro Tourism Sdn Bhd (FFATSB) a subsidiary owned and operated by Farm Fresh Berhad. This dairy farm is also established as the Industry Centre of Excellence together with University Putra Malaysia.
            </li>
            <li>
              By entering Farm Fresh @ UPM, visitors consent to these terms and conditions (which also incorporate the privacy notice available at <a href="https://www.farmfresh.com.my/wp-content/uploads/2021/08/POLICY-THMC-PDPA-Rev-3.pdf" target="_blank" rel="noopener noreferrer" className="text-[#445412] underline hover:text-[#5d721a] break-all">https://www.farmfresh.com.my/wp-content/uploads/2021/08/POLICY-THMC-PDPA-Rev-3.pdf</a>) 
              ("these T&C&"). Adults (aged 18 years and above) bringing minors to Farm Fresh @ UPM represent that they have the authority to agree that these T&C apply to such minors and hereby indemnify FFATSB against any claim by the minor or his/her parent or legal guardian arising from such representations being false.
            </li>
            <li>
              These T&C shall be construed in accordance with, and governed under, the laws of Malaysia. These T&C are subject to change from time to time without prior notice.
            </li>
            <li>
              Visitors shall abide by the reasonable directions issued by FFATSB personnel, announcements broadcast and notices posted at Farm Fresh @ UPM as well as other owned social or digital platforms and related terms and conditions, 
              policies and rules as FFATSB or FFB may issue from time to time regarding Farm Fresh @ UPM and other related entities on this vicinity.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-fraunces font-black text-xl md:text-2xl text-[#445412] uppercase tracking-wider border-l-4 border-[#445412] pl-3">
            GROUP BOOKINGS
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>Group Tour bookings will be subjected to first come first serve booking basis, along with availability of Tour Guide during the day of booking.
                Tour Guides are optional and chargeable with RM150 for maximum 50 pax per tour guide. A 14-days booking in advance is required and 5 days payment terms before tour date.
            </li>
            <li>FFATSB will require prior info before booking of all guests coming - arrangement, no. of pax of adults and kids, coordination of the groups tour leader
                and reps of Farm Fresh @ UPM
            </li>
            <li>Total package price will be fixed based on the packages set for each tour group, no further discounts or adhoc request entertained</li>
            <li>OKU or special needs individuals must be accompanied by their parents, guardians or assistant.</li>
            <li>FFATSB reserves the rights to amend the tour packages at anytime without prior notice.</li>
            <li>For Group bookings, please WhatsApp us at number 016-206 7133 or email theacre@farmfreshmilk.com.my</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-fraunces font-black text-xl md:text-2xl text-[#445412] uppercase tracking-wider border-l-4 border-[#445412] pl-3">
            ADMISSION (NORMAL & GROUP TOUR)
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>Each ticket is for one-day admission of one person to Farm Fresh @ UPM once purchase at the door.</li>
            <li>Admission is subject to Farm Fresh @ UPM's operating hours (which may change from time to time without prior notice) and capacity limitation</li>
            <li>The ticket is non-refundable, nontransferable, and non-resell able. It cannot be replaced if lost, stolen, or damaged, and will be deemed invalid
                if altered or tampered with in any way. Additionally,m the ticket does not provide any refund or compensation in the event of weather-related disruptions, cancellations, or other unforeseen circumstances.
                By purchasing the ticket, the holder acknowledges and agrees to these terms.
            </li>
            <li>FFATSN do not entertain of any refunds due to bad weather(heavy raining, lightning, heat waves etc.)</li>
            <li>Children below the age of 10 must be accompanied by an adult at all times when inside Farm Fresh @ UPM. For proper care and attention while at Farm Fresh @ UPM, it is recommended that each adult accompanies no more thatn 5 kids.</li>
            <li>Children between the age of 10 and 17 years are allowed without being accompanied by an adult, but an adult must be present for the children at point of drop off & pick up</li>
            <li>Children below the age of 3 years and below will be allowed to Farm Fresh @ UPM for free. FFATSB may require accompanying adults to provide proof of identification of their children at any time during visit at Farm Fresh @ UPM</li>
            <li>Visitors must be dressed appropriately having regard to the nature it's outdoor environment, and have the right weather proofing gears - ie. Umbrellas / raincoats / sports or walking shoes / etc.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-fraunces font-black text-xl md:text-2xl text-[#445412] uppercase tracking-wider border-l-4 border-[#445412] pl-3">
            IN THE FARM
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>Entrance tickets must be purchased at the door, in a systematic order of queuing upon arrival</li>
            <li>Everyone is to read the house rules and understand the nature of how this farm operates and abiding by the rules & regulations of the place</li>
            <li>Be aware of certain signages to guide you with more info / direction on where to go and how to care for the flora & fauna of the place.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-fraunces font-black text-xl md:text-2xl text-[#445412] uppercase tracking-wider border-l-4 border-[#445412] pl-3">
            PROHIBITED ACTIVITIES
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>While at Farm Fresh @ UPM, visitors must not:</li>
                <ul className="list-[circle] list-outside pl-5 mt-2 space-y-1">
                    <li>Offer or display any goods or services for sale</li>
                    <li>Distribute any printed or recorded material</li>
                    <li>Bring any flag, banner or sign</li>
                    <li>Play any music or sound, except via personal earphones</li>
                    <li>Cause public discomfort or incite a crowd, including by conducting demonstrations; giving speechesl preaching any political, religious or other cause not prior authorised in writing by FFATSB</li>
                    <li>Prohibit to sit on any of our cow mannequins or hand on their horns. If spotted on it with any damages done, management has the right to seek compensation for damages</li>
                    <li>Commercial photography and videography are chargeable by rent of venue space. Kindly enquire by emailing your details to hello@farmfreshmilk.com.my for more info</li>
                    <li>To respect and be courteous other visitng groups when it comes to public sharing activities - restaurant tables / chairs, tractor rides, barrel rides, & horse rides</li>
                    <li>Smoke (including using cigars, electronic cigarettes or vaporisers)</li>
                    <li>Group tour visitors present would be the tour guide's priority over those who enter as Free & Easy normal entry visitors. All rides booked for roup tours will take precedence over normal entry ticket visitors. That being said, operator
                        will at best ensure rides are equally covered for as many as the rides can take.
                    </li>
                </ul>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-fraunces font-black text-xl md:text-2xl text-[#445412] uppercase tracking-wider border-l-4 border-[#445412] pl-3">
            PROHIBITED ITEMS
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>The following may not the brought into Farm Fresh @ UPM</li>
                <ul className="list-[circle] list-outside pl-5 mt-2 space-y-1">
                    <li>Pets</li>
                    <li>Outside food and beverage, except for bottled water, medicine and baby food or milk formula</li>
                    <li>Glass containers</li>
                    <li>Illegal, hazardous or combustible items</li>
                    <li>Transport devices with wheels (Except wheelchairs & baby strollers), including without limitation skateboards, scooter, in-line skates or shoes with built-in wheels</li>
                    <li>Remote-controlled devices and unmanned aerial vehicles (drones) unless written consent by FFATSB</li>
                    <li>Folding chairs & other picnic set up</li>
                    <li>Weapons or items that appear to be used as weapons</li>
                </ul>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-fraunces font-black text-xl md:text-2xl text-[#445412] uppercase tracking-wider border-l-4 border-[#445412] pl-3">
            SAFETY, SECURITY AND COMFORT
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>By entering Farm Fresh @ UPM, visitors accept that they have a duty to take reasonable steps to ensure their own safety & security of their belongings and, tracking
                into account any personal medical conditions. All visitors in and around Farm Fresh @ UPM should behave in a safe manner at all times and accompanyinh adults shall exercise reasobale steps in supervising the kids.
            </li>
            <li>Upon admission, each visitor will be requested to put on a wristband or a group tour flag (for those with group bookings). For re-entry, safety and security this must be kept on the visitor at all times within Farm Fresh @ UPM until exit of the place</li>
            <li>FFATSB may conduct security checks on visitors' belongings at any time</li>
            <li>FFATSB may, without refund or compensation, refuse admission to, or remove from Farm Fresh @ UPM, any visitor who contravenes these T&C.</li>
          </ul>
        </section>

    </article>
    </main>
)
}
