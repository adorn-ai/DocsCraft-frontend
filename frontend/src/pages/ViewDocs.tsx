import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Download, Copy, ArrowLeft, Loader2, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ViewDocs() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/docs/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }

      const jobData = await response.json();
      setJob(jobData);

      if (jobData.status === "completed") {
        const storagePaths = JSON.parse(jobData.storage_path);
        const filenames = Object.keys(storagePaths);
        
        const docsObj: Record<string, string> = {};
        
        for (const filename of filenames) {
          try {
            const fileResponse = await fetch(
              `${API_URL}/docs/job/${jobId}/download?filename=${encodeURIComponent(filename)}`,
              {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`
                }
              }
            );
            
            if (fileResponse.ok) {
              const content = await fileResponse.text();
              docsObj[filename] = content;
            }
          } catch (err) {
            console.error(`Failed to download ${filename}:`, err);
          }
        }
        
        setDocs(docsObj);
        
        if (filenames.length > 0 && !activeTab) {
          setActiveTab(filenames[0]);
        }
      } else if (jobData.status === "failed") {
        setError("Documentation generation failed");
      } else if (jobData.status === "processing") {
        setError("Documentation is still being generated");
      }
    } catch (error: any) {
      console.error("Error fetching job:", error);
      setError(error.message || "Failed to load documentation");
      toast.error("Failed to load documentation", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(`${API_URL}/docs/job/${jobId}/download`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `docs_${jobId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Downloaded successfully!");
    } catch (error: any) {
      toast.error("Download failed", {
        description: error.message
      });
    }
  };

  const handleDownloadSingle = (filename: string) => {
    if (!docs[filename]) {
      toast.error("No content to download");
      return;
    }

    const blob = new Blob([docs[filename]], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${filename}!`);
  };

  const handleCopy = (filename: string) => {
    if (!docs[filename]) {
      toast.error("No content to copy");
      return;
    }

    navigator.clipboard.writeText(docs[filename]);
    toast.success(`Copied ${filename} to clipboard!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <p className="text-gray-800 font-medium">
                {error || "Job not found"}
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (Object.keys(docs).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">
              No documentation content available
            </p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filenames = Object.keys(docs);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleDownloadAll} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full flex-wrap h-auto gap-2 bg-transparent p-0">
            {filenames.map((filename) => (
              <TabsTrigger 
                key={filename} 
                value={filename}
                className="flex-1 min-w-[120px] data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{filename}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {filenames.map((filename) => (
            <TabsContent key={filename} value={filename}>
              <Card>
                <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(filename)}
                    className="w-full sm:w-auto"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownloadSingle(filename)}
                    className="w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <CardContent className="p-4 sm:p-8">
                  {/* Mobile-optimized prose styles */}
                  <div className="prose prose-sm sm:prose prose-gray max-w-none
                    prose-headings:break-words
                    prose-p:break-words
                    prose-code:break-all
                    prose-pre:overflow-x-auto
                    prose-table:block
                    prose-table:overflow-x-auto
                    prose-table:max-w-full
                    prose-td:break-words
                    prose-th:break-words
                  ">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Responsive code blocks
                        code: ({ node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const language = match ? match[1] : "";
                          const isInline = !className;

                          return !isInline ? (
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                              <SyntaxHighlighter
                                style={oneDark}
                                language={language}
                                PreTag="div"
                                customStyle={{
                                  margin: 0,
                                  borderRadius: '0.5rem',
                                  fontSize: '0.875rem',
                                }}
                                wrapLongLines={true}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className={`${className} break-all`} {...props}>
                              {children}
                            </code>
                          );
                        },
                        // Responsive tables
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto -mx-4 sm:mx-0 my-4">
                            <table className="min-w-full" {...props} />
                          </div>
                        ),
                        // Break long links
                        a: ({ node, ...props }) => (
                          <a className="break-all" {...props} />
                        ),
                      }}
                    >
                      {docs[filename]}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}