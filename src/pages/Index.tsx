"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/FileUploader";
import { useEpubProcessor } from "@/hooks/useEpubProcessor";
import { Header } from "@/components/Header";
import { ProfileSelector } from "@/components/ProfileSelector";
import { templates } from "@/lib/templates";
import { Download } from "lucide-react";

export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>(templates[0].id);
  const { isProcessing, processedBlob, error, processEpub, progress } = useEpubProcessor();

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      processEpub(file);
    }
  };

  const handleDownload = () => {
    if (processedBlob && selectedFile) {
      const url = URL.createObjectURL(processedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `processed-${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedProfile);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Choose a Profile</CardTitle>
              <CardDescription>Select a processing profile for your ePUB file.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSelector selectedProfile={selectedProfile} onProfileChange={setSelectedProfile} />
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>2. Upload your ePUB</CardTitle>
                <CardDescription>
                  {selectedTemplate ? `Using the "${selectedTemplate.name}" profile.` : 'Please select a profile first.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onFileSelect={handleFileSelect} disabled={isProcessing} />
              </CardContent>
            </Card>

            {error && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Processing Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {(isProcessing || (processedBlob && !error)) && (
              <Card>
                <CardHeader>
                  <CardTitle>{isProcessing ? 'Processing...' : '3. Download'}</CardTitle>
                  <CardDescription>
                    {isProcessing ? 'Please wait while we process your file.' : 'Your processed ePUB is ready.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs">
                      {isProcessing ? (
                        <Button disabled className="w-full text-lg py-6 relative overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-primary/30 transition-all duration-150" 
                            style={{ width: `${progress}%` }} 
                          />
                          <span className="relative z-10">Processing... {progress}%</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={handleDownload}
                          disabled={!processedBlob}
                          className="w-full text-lg py-6"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          Download Processed File
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}