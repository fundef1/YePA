"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { unzipEpub } from "../lib/unzip";
import { applyTemplate } from "../lib/template-applier";
import { zipFileContents } from "../lib/zip";
import { templates } from "../lib/templates";
import { resizeImages, grayscaleImages } from "../lib/pipeline";
import { Header } from "@/components/Header";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Separator } from "@/components/ui/separator";
import { ProfileSelector } from "@/components/ProfileSelector";

export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates[0].name
  );
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedFilename, setProcessedFilename] = useState<string>("");
  const logContainerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setLog([`Selected file: ${file.name}`]);
    } else {
      setLog([]);
    }
    setProgress(0);
    setProcessedBlob(null);
    setProcessedFilename("");
  };

  const appendLog = (message: string) => {
    setLog((prevLog) => [...prevLog, message]);
  };

  const processEpub = async (file: File, templateName: string) => {
    setIsProcessing(true);
    setProcessedBlob(null);
    setProcessedFilename("");
    setLog([`Starting processing with template: ${templateName}...`]);
    setProgress(0);

    const currentTemplate = templates.find((t) => t.name === templateName);
    if (!currentTemplate) {
      appendLog(`Error: Template ${templateName} not found.`);
      setIsProcessing(false);
      return;
    }

    try {
      let entries = await unzipEpub(file, appendLog, (p) =>
        setProgress(p * 0.25)
      );
      let modifiedEntries = await applyTemplate(
        entries,
        currentTemplate,
        appendLog,
        (p) => setProgress(25 + p * 0.25)
      );
      const { maxWidth, maxHeight, grayscaleLevels } = currentTemplate;
      modifiedEntries = await resizeImages(
        modifiedEntries,
        maxWidth,
        maxHeight,
        appendLog,
        (p) => setProgress(50 + p * 0.25)
      );
      modifiedEntries = await grayscaleImages(
        modifiedEntries,
        grayscaleLevels,
        appendLog,
        (p) => setProgress(75 + p * 0.15)
      );
      const finalBlob = await zipFileContents(modifiedEntries, appendLog, (p) =>
        setProgress(90 + p * 0.10)
      );
      setProcessedBlob(finalBlob);
      setProcessedFilename(file.name.replace(".epub", `_${templateName}.epub`));
      appendLog("Processing complete! Click 'Download File' to save.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      appendLog(`FATAL ERROR: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleDownload = () => {
    if (!processedBlob || !processedFilename) return;
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = processedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    appendLog(`Downloaded ${processedFilename}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-3xl">
        <Header />
        <Card className="w-full shadow-lg dark:shadow-black/20">
          <CardHeader>
            <CardTitle>Optimization Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>1. Select an optimization profile</Label>
              <ProfileSelector
                templates={templates}
                selectedValue={selectedTemplate}
                onValueChange={setSelectedTemplate}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label>2. Upload your EPUB</Label>
              <FileUploader onFileSelect={handleFileChange} disabled={isProcessing} />
            </div>
            <div className="space-y-2">
              <Label>3. Process and Download</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => selectedFile && processEpub(selectedFile, selectedTemplate)}
                  disabled={!selectedFile || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Processing..." : "Process EPUB"}
                </Button>
                {processedBlob && !isProcessing && (
                  <Button onClick={handleDownload} variant="secondary" className="w-full">
                    Download File
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          
          {(isProcessing || log.length > 1) && (
            <>
              <Separator className="my-4" />
              <CardContent>
                <Label>Processing Log</Label>
                {isProcessing && (
                  <div className="w-full my-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground mt-1">{Math.round(progress)}%</p>
                  </div>
                )}
                <div className="mt-2 w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-md p-3">
                  <pre ref={logContainerRef} className="text-xs font-mono whitespace-pre-wrap h-full overflow-y-auto">
                    {log.join('\n')}
                  </pre>
                </div>
              </CardContent>
            </>
          )}

          <CardFooter className="justify-center">
            <MadeWithDyad />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}