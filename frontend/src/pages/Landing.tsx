import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Zap,
  Shield,
  Github,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="GitCrafts" className="h-20 w-20" />
            <span className="text-2xl font-bold text-gray-900">GitCrafts</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-orange-600 transition"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-orange-600 transition"
            >
              Pricing
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-orange-600 transition"
            >
              How it Works
            </a>
          </div>
          <Button
            onClick={() => navigate("/login")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-8">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">
              AI-powered documentation
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            AI-powered builder
            <br />
            <span className="text-orange-600">for your ideas</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            GitCrafts lets you generate professional documentation in minutes
            using AI, no coding required. Built for developers, by developers
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg"
            >
              <Github className="mr-2 h-5 w-5" />
              Start Building Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-50 px-8 py-6 text-lg"
            >
              View Pricing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Not sure where to start section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <p className="text-gray-600 mb-4">
              Not sure where to start? Try one of these:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-left">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">README.md</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-left">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">API Docs</span>
              </button>
              {/*
              <button className="flex items-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-left">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Changelog</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-left">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Contributing Guide</span>
              </button>
              */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why GitCrafts?
            </h2>
            <p className="text-xl text-gray-600">
              Professional documentation in seconds, powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-orange-200 transition">
              <CardContent className="p-8">
                <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Generate comprehensive documentation in under 60 seconds. No
                  more spending hours writing docs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition">
              <CardContent className="p-8">
                <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Private & Secure
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Works with private repositories. Your code stays on GitHub, we
                  only analyze structure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-orange-200 transition">
              <CardContent className="p-8">
                <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Multiple Formats
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  README, API docs, changelogs, and contributing guidelines, all
                  in one place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to perfect documentation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Connect Repository
              </h3>
              <p className="text-gray-600">
                Sign in with GitHub and connect your repository, public or
                private.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Choose Docs
              </h3>
              <p className="text-gray-600">
                Select which documentation types you want to generate.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Generate & Download
              </h3>
              <p className="text-gray-600">
                AI generates professional docs in seconds. Download or copy
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-gray-600 mb-6">Perfect for trying out</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold">$ 0</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>1 generation per day</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>README.md and API.md only</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Public repositories</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-orange-600 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-gray-600 mb-6">
                  For developers with heavy documentation needs
                </p>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl text-gray-400 line-through">
                      $ 7.99
                    </span>
                    <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      25% OFF
                    </span>
                  </div>
                  <div>
                    <span className="text-5xl font-bold text-orange-600">
                      $ 5.99
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">Unlimited generations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>All document types</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Public & private repos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate("/pricing")}
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join developers who are shipping faster with AI-generated docs
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg"
          >
            Start Free Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              {/*<img src="/src/assets/G (1).png" alt="GitCrafts" className="h-16 w-16 invert" />*/}
              <span className="text-xl font-bold">GitCrafts</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            © 2024 GitCrafts. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
