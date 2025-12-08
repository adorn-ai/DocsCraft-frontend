import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Github,
  Lock,
  Zap,
  FileText,
  Code2,
  Download,
  Shield,
  Clock,
  Globe,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export default function Features() {
  const navigate = useNavigate()

  const mainFeatures = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Advanced AI analyzes your codebase and generates human-quality documentation tailored to your project.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Seamlessly connect with your GitHub repositories. Support for both public and private repos.',
      color: 'text-gray-900',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Lock,
      title: 'Private Repo Support',
      description: 'Access private repositories securely with Pro plan. Your code stays private and secure.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate comprehensive documentation in 30-60 seconds. No more hours spent writing docs.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: FileText,
      title: 'Multiple Doc Types',
      description: 'Create README, API documentation, CHANGELOG, CONTRIBUTING guides, and more.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Code2,
      title: 'Multi-Language Support',
      description: 'Works with Python, JavaScript, TypeScript, Go, Rust, Java, and many more languages.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  const additionalFeatures = [
    {
      icon: Download,
      title: 'Easy Export',
      description: 'Download as Markdown files ready to add to your repository.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your code is analyzed securely and never stored permanently.'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Hours of documentation work done in seconds.'
    },
    {
      icon: Globe,
      title: 'Always Available',
      description: 'Generate docs anytime, anywhere with our cloud platform.'
    }
  ]

  const comparisonItems = [
    { feature: 'AI-Powered Generation', manual: false, gitcrafts: true },
    { feature: 'Multi-Language Support', manual: false, gitcrafts: true },
    { feature: 'Private Repo Access', manual: false, gitcrafts: true },
    { feature: 'Time Required', manual: 'Hours', gitcrafts: 'Seconds' },
    { feature: 'Consistency', manual: 'Varies', gitcrafts: 'Always High' },
    { feature: 'Cost', manual: 'High', gitcrafts: 'Low' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="GitCrafts" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900">GitCrafts</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/how-it-works')}>
              How It Works
            </Button>
            <Button variant="ghost" onClick={() => navigate('/pricing')}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => navigate('/contact')}>
              Contact
            </Button>
            <Button onClick={() => navigate('/login')} className="bg-orange-600 hover:bg-orange-700">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-200">
            All Features
          </Badge>
          <h1 className="text-5xl font-bold mb-6">
            Everything You Need for
            <span className="text-orange-600"> Perfect Documentation</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to make documentation generation effortless, 
            fast, and professional.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">More Great Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <feature.icon className="h-10 w-10 mx-auto mb-4 text-orange-600" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-4">GitCrafts vs Manual Documentation</h2>
          <p className="text-center text-gray-600 mb-12">See why developers choose GitCrafts</p>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">Manual</th>
                      <th className="text-center p-4 font-semibold text-orange-600">GitCrafts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonItems.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4 font-medium">{item.feature}</td>
                        <td className="p-4 text-center">
                          {typeof item.manual === 'boolean' ? (
                            item.manual ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-600">{item.manual}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof item.gitcrafts === 'boolean' ? (
                            item.gitcrafts ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-orange-600 font-medium">{item.gitcrafts}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Individual Developers</h3>
                <p className="text-gray-600 mb-4">
                  Save time on personal projects and open source contributions. Focus on code, not docs.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Quick README generation
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Side project documentation
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Portfolio showcase
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Development Teams</h3>
                <p className="text-gray-600 mb-4">
                  Maintain consistent documentation across all team projects with minimal effort.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Consistent standards
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Onboarding materials
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    API documentation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3">Startups & Companies</h3>
                <p className="text-gray-600 mb-4">
                  Professional documentation for all products without hiring technical writers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Cost effective
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Scalable solution
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Multiple repositories
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="py-16 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Documentation?</h2>
            <p className="text-xl mb-8 text-orange-50 max-w-2xl mx-auto">
              Join thousands of developers who have already saved countless hours with GitCrafts
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100"
                onClick={() => navigate('/login')}
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-orange-600"
                onClick={() => navigate('/how-it-works')}
              >
                See How It Works
              </Button>
            </div>
            <p className="mt-6 text-orange-100 text-sm">No credit card required • Free plan available</p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2024 GitCrafts. All rights reserved.</p>
            <div className="flex gap-6">
              <button onClick={() => navigate('/how-it-works')} className="text-sm text-gray-600 hover:text-orange-600">
                How It Works
              </button>
              <button onClick={() => navigate('/pricing')} className="text-sm text-gray-600 hover:text-orange-600">
                Pricing
              </button>
              <button onClick={() => navigate('/contact')} className="text-sm text-gray-600 hover:text-orange-600">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}