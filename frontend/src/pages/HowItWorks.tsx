import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react"

const LOOM_EMBED_URL =
  "https://www.loom.com/embed/8909dc3cb82943e6803d3d492e1fa0cd"

const LOOM_SHARE_URL =
  "https://www.loom.com/share/8909dc3cb82943e6803d3d492e1fa0cd"

export default function HowItWorks() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Nav (same as Features) */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/logo.png" alt="GitCrafts" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900">GitCrafts</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-orange-100 text-orange-700">
            How It Works
          </Badge>
          <h1 className="text-5xl font-bold mb-6">
            From Repo to Docs in
            <span className="text-orange-600"> Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how GitCrafts analyzes your repository and generates
            production-ready documentation automatically.
          </p>
        </div>

        {/* Video Card */}
        <Card className="max-w-5xl mx-auto shadow-xl mb-16">
          <CardContent className="p-4 sm:p-6">
            <div className="aspect-video w-full rounded-xl overflow-hidden border">
              <iframe
                src={LOOM_EMBED_URL}
                title="GitCrafts Demo"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Prefer Loom?
              </p>

              <Button variant="outline" asChild>
                <a
                  href={LOOM_SHARE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on Loom
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">
            Simple 3-Step Workflow
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Connect GitHub",
                desc: "Add your public or private repository securely."
              },
              {
                title: "AI Analysis",
                desc: "We analyze structure, code, and context automatically."
              },
              {
                title: "Generate Docs",
                desc: "Download clean, consistent documentation instantly."
              }
            ].map((step, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-4 text-orange-600" />
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="py-16 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Try It on Your Repo
            </h2>
            <p className="text-xl mb-8 text-orange-50 max-w-2xl mx-auto">
              Generate professional documentation without writing a single line.
            </p>

            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              onClick={() => navigate("/login")}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="mt-6 text-orange-100 text-sm">
              No credit card required
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
