import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/auth/register" className="inline-flex items-center text-gold-500 hover:text-gold-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registration
          </Link>
        </div>

        <div className="prose prose-gray max-w-none">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-8">Terms and Conditions</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Global Saanvika&apos;s website and services, you accept and agree to be bound by the
                terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Products and Services</h2>
              <p>
                Global Saanvika offers premium jewelry, photo frames, and resin art. All product descriptions, prices,
                and availability are subject to change without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Orders and Payment</h2>
              <p>
                All orders are subject to acceptance and availability. Payment must be made in full before shipment. We
                accept various payment methods including credit cards and digital wallets.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Shipping and Returns</h2>
              <p>
                We ship worldwide with various shipping options. Returns are accepted within 30 days of delivery for
                unused items in original packaging.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
                protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Information</h2>
              <p>For questions about these terms, please contact us at legal@globalsaanvika.com</p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Last updated: January 15, 2024</p>
          </div>
        </div>
      </div>
    </div>
  )
}

