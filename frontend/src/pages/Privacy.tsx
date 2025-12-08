import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react'

export default function Privacy() {
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
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-10 w-10 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        <p className="text-gray-600 mb-8">Last updated: December 08, 2024</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <p className="text-gray-700 text-lg">
              At GitCrafts, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-semibold text-gray-900">1. Information We Collect</h2>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Personal Information</h3>
            <p className="text-gray-700 mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Name and email address (from OAuth providers)</li>
              <li>GitHub or Google account information</li>
              <li>Payment information (processed securely through Paystack)</li>
              <li>Repository URLs you connect to our service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Usage Information</h3>
            <p className="text-gray-700 mb-3">We automatically collect certain information when you use our Service:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Device information</li>
              <li>Usage patterns and preferences</li>
              <li>Documentation generation history</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-semibold text-gray-900">2. How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect and prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-semibold text-gray-900">3. Data Security</h2>
            </div>
            <p className="text-gray-700 mb-3">
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and assessments</li>
              <li>Limited access to personal information</li>
              <li>Secure authentication via OAuth 2.0</li>
              <li>Two-factor authentication support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Repository Data</h2>
            <p className="text-gray-700 mb-3">
              When you connect a repository to GitCrafts:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>We only access the repository structure and file names</li>
              <li>We analyze code to generate documentation</li>
              <li>Your code remains on GitHub; we don't store it permanently</li>
              <li>Private repository data is encrypted and access-controlled</li>
              <li>We never share your repository data with third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Third-Party Services</h2>
            <p className="text-gray-700 mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>GitHub:</strong> For authentication and repository access</li>
              <li><strong>Google:</strong> For authentication</li>
              <li><strong>Paystack:</strong> For payment processing</li>
              <li><strong>Supabase:</strong> For database and authentication</li>
              <li><strong>Anthropic API:</strong> For AI-powered documentation generation</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Each service has its own privacy policy governing the use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to provide our services and comply with 
              legal obligations. You can request deletion of your account and associated data at any time through 
              your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p className="text-gray-700">
              We use cookies and similar tracking technologies to track activity on our Service and hold certain 
              information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
            <p className="text-gray-700">
              Our Service is not intended for children under 13. We do not knowingly collect personal information 
              from children under 13. If you become aware that a child has provided us with personal information, 
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@gitcrafts.com" className="text-orange-600 hover:underline">
                support@gitcrafts.com
              </a>
            </p>
          </section>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-semibold text-orange-900 mb-2">Your Privacy Matters</h3>
            <p className="text-orange-800">
              We are committed to protecting your privacy and being transparent about how we use your data. 
              If you have any concerns, please don't hesitate to reach out to us.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}