import { Link } from "@tanstack/react-router"

export function PublicFooter() {
    return (
        <footer className="w-screen bg-[#445412] text-[#fbf0d8] font-sans mt-auto border-t border-[#fbf0d8]/10">
            <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Left Side: Copyright or Branding */}
                <div className="text-center sm:text-left">
                <p className="text-sm font-medium font-sans">
                    &copy; {new Date().getFullYear()} Farm Fresh @ UPM. All rights reserved.
                </p>
                <p className="text-sm font-extralight font-sans text-[#566b18]">
                    Website built by Safuan Hakim.
                </p>
                </div>

                {/* Right Side: Footer Navigation Links */}
                <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
                <Link
                    to="/tnc" 
                    className="hover:text-white transition-colors duration-200 underline-offset-4 hover:underline"
                >
                    Terms & Conditions
                </Link>
                <a 
                    href="https://linktr.ee/theacrefarmfresh" 
                    className="hover:text-white transition-colors duration-200 underline-offset-4 hover:underline"
                >
                    Contact Us
                </a>
                </div>
            </div>
        </footer>
    )
}
