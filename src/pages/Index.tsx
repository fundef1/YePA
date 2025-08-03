"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { unzipEpub } from "../lib/unzip";
import { applyTemplate } from "../lib/template-applier";
import { zipFileContents } from "../lib/zip";
import { templates, Template } from "../lib/templates";
import { resizeImages, grayscaleImages } from "../lib/pipeline";
import { Header } from "@/components/Header";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FooterAttribution } from "@/components/FooterAttribution";
import { Separator } from "@/components/ui/separator";
import { ProfileSelector } from "@/components/ProfileSelector";
import { AnimatedGradientBackground } from "@/components/AnimatedGradientBackground";
import { DownloadCloud, ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconBackground } from "@/components/IconBackground";
import { getCookie, setCookie } from "../lib/cookies";

const PROFILE_COOKIE_NAME = "yepa_profile";

export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(() => {
    const savedProfileName = getCookie(PROFILE_COOKIE_NAME);
    const passThroughTemplate = templates.find(t => t.name === "Pass-Through");

    if (!passThroughTemplate) {
      console.error("Default 'Pass-Through' template not found!");
      return templates[0];
    }

    if (savedProfileName) {
      const savedTemplate = templates.find(t => t.name === savedProfileName);
      return savedTemplate || passThroughTemplate;
    }
    
    return passThroughTemplate;
  });
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedFilename, setProcessedFilename] = useState<string>("");
  const logContainerRef = useRef<HTMLPreElement>(null);

  const appendLog = useCallback((message: string) => {
    setLog((prevLog) => [...prevLog, message]);
  }, []);

  const processEpub = useCallback(async (file: File, templateName: string) => {
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
  }, [appendLog]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]);
  
  useEffect(() => {
    if (selectedFile) {
      processEpub(selectedFile, selectedTemplate.name);
    }
  }, [selectedFile, selectedTemplate, processEpub]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (!file) {
      setLog([]);
      setProgress(0);
      setProcessedBlob(null);
      setProcessedFilename("");
    }
  };

  const handleTemplateChange = (templateName: string) => {
    const newTemplate = templates.find((t) => t.name === templateName);
    if (newTemplate) {
      setSelectedTemplate(newTemplate);
      setCookie(PROFILE_COOKIE_NAME, newTemplate.name, 365);
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
    <div className="min-h-screen py-8 sm:py-12">
      <IconBackground
        maxWidth={selectedTemplate.maxWidth}
        maxHeight={selectedTemplate.maxHeight}
        isGrayscale={selectedTemplate.grayscaleLevels > 0}
      />
      <AnimatedGradientBackground isGrayscale={selectedTemplate.grayscaleLevels > 0} />
      <div className="container mx-auto max-w-5xl">
        <Header 
          isColorful={selectedTemplate.grayscaleLevels > 0}
          maxWidth={selectedTemplate.maxWidth}
          maxHeight={selectedTemplate.maxHeight}
        />
        <Card className="w-full shadow-lg dark:shadow-black/20">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>1. Select an optimization profile</Label>
              <ProfileSelector
                templates={templates}
                selectedValue={selectedTemplate.name}
                onValueChange={handleTemplateChange}
                disabled={isProcessing}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>2. Upload your ePUB</Label>
                <FileUploader onFileSelect={handleFileChange} disabled={isProcessing} />
              </div>
              <div className="space-y-2">
                <Label>3. Download your ePUB</Label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 p-8 h-[220px]">
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <DownloadCloud className="w-12 h-12 text-primary" />
                      <div className="w-full max-w-xs">
                        <Button
                          onClick={handleDownload}
                          disabled={isProcessing || !processedBlob}
                          className="w-full text-lg py-6 relative overflow-hidden transition-colors"
                        >
                          {isProcessing ? (
                            <>
                              <div
                                className="absolute top-0 left-0 h-full bg-primary/50 dark:bg-primary/30"
                                style={{ width: `${progress}%`, transition: 'width 0.1s ease-in-out' }}
                              />
                              <span className="relative z-10 tabular-nums">
                                Processing... {Math.round(progress)}%
                              </span>
                            </>
                          ) : (
                            "Download File"
                          )}
                        </Button>
                        <p className="mt-2 text-sm text-muted-foreground truncate h-5">
                          {isProcessing ? <>&nbsp;</> : <>&nbsp;</>}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DownloadCloud className="w-12 h-12 mb-2" />
                      <p className="font-semibold text-center">Upload a file to enable download</p>
                      <p className="text-sm">then</p>
                      <Button type="button" variant="outline" disabled>Download File</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </CardContent>
          
          <Separator className="my-4" />
          <CardContent>
            <Collapsible>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Processing Log</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle Log</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pt-2">
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-md p-3">
                  <pre ref={logContainerRef} className="text-xs font-mono whitespace-pre-wrap h-full overflow-y-auto">
                    {log.join('\n')}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>

          <CardFooter className="justify-center">
            <FooterAttribution />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}