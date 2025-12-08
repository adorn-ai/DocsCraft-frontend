import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <nav className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
        <p className="text-gray-600 mb-8">Last updated: December 01, 2025</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p className="text-gray-700">
              By accessing and using GitCrafts ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Use License</h2>
            <p className="text-gray-700 mb-3">
              Permission is granted to temporarily access and use GitCrafts for personal and commercial documentation generation purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose without a subscription</li>
              <li>Attempt to reverse engineer any software contained on GitCrafts</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="text-gray-700">
              When you create an account with us, you must provide accurate, complete, and current information. 
              Failure to do so constitutes a breach of the Terms. You are responsible for safeguarding your account 
              and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Subscription Services</h2>
            <p className="text-gray-700 mb-3">
              Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring 
              and periodic basis. Billing cycles are set on a monthly basis.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You can cancel your subscription at any time through your account settings</li>
              <li>Refunds are handled on a case-by-case basis</li>
              <li>Price changes will be notified 30 days in advance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Acceptable Use</h2>
            <p className="text-gray-700 mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Generate documentation for illegal or harmful purposes</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
            <p className="text-gray-700">
              The Service and its original content (excluding user-generated content), features, and functionality 
              are owned by GitCrafts and are protected by international copyright, trademark, patent, trade secret, 
              and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Generated Content</h2>
            <p className="text-gray-700">
              You retain all rights to the documentation generated using our Service. GitCrafts claims no intellectual 
              property rights over the material you generate. You are free to use, modify, and distribute the generated 
              documentation as you see fit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p className="text-gray-700">
              In no event shall GitCrafts, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p className="text-gray-700">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
              whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use 
              the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
              try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:support@gitcrafts.com" className="text-orange-600 hover:underline">
                support@gitcrafts.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}