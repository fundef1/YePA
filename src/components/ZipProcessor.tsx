"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ZipReader, BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";

// Helper function to unzip a file and extract its contents
const unzipFileContents = async (
  file: File,
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<{ filename: string; data: Blob }[]> => {
  appendLog("Unzipping file...");
  const reader = new ZipReader(new BlobReader(file));
  const entries = await reader.getEntries();
  appendLog(`Found ${entries.length} entries.`);

  const extractedEntries: { filename: string; data: Blob }[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    appendLog(`Extracting: ${entry.filename}`);
    const data = await entry.getData(new BlobWriter());
    extractedEntries.push({ filename: entry.filename, data });
    setProgress(((i + 1) / entries.length) * 50); // Progress for unzipping (0-50%)
  }
  await reader.close();
  appendLog("Unzipping complete.");
  return extractedEntries;
};

// Helper function to zip contents into a new file
const zipFileContents = async (
  entriesToZip: { filename: string; data: Blob }[],
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<Blob> => {
  appendLog("Zipping file...");
  const writer = new ZipWriter(new BlobWriter("application/zip"));

  for (let i = 0; i < entriesToZip.length; i++) {
    const entry = entriesToZip[i];
    appendLog(`Adding to zip: ${entry.filename}`);
    await writer.add(entry.filename, new BlobReader(entry.data));
    setProgress(50 + ((i + 1) / entriesToZip.length) * 50); // Progress for zipping (50-100%)
  }
  const blob = await writer.close();
  appendLog("Zipping complete.");
  return blob;
};

const ZipProcessor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [template, setTemplate] = useState("pass-through");
  const logContainerRef = useRef<HTMLDivElement>(null);

  const appendLog = useCallback((message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, 0);
  }, []);

  const processFile = useCallback(async () => {
    if (!file) {
      toast.error("No file selected for processing.");
      return;
    }

    setIsProcessing(true);
    setProcessedFile(null); // Reset processed file state at the start of new processing
    setLogs([]); // Clear logs for new processing
    setProgress(0);
    appendLog("Processing started...");
    appendLog(`Using template: ${template}`);

    try {
      let processedEntries: { filename: string; data: Blob }[] = [];

      // Step 1: Unzip the file
      processedEntries = await unzipFileContents(file, appendLog, setProgress);

      // Step 2: Apply template-specific logic (currently only pass-through)
      // For the 'pass-through' template, no modifications are made to the entries.
      appendLog("Applying pass-through template (no modifications).");

      // Step 3: Zip the processed entries back into a new file
      const blob = await zipFileContents(processedEntries, appendLog, setProgress);

      setProcessedFile(blob);
      appendLog("Processing complete!");
      toast.success("EPUB processed successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      appendLog(`Error: ${errorMessage}`);
      toast.error("An error occurred during processing.");
    } finally {
      setIsProcessing(false);
    }
  }, [file, template, appendLog, setProgress]);

  useEffect(() => {
    // Only process if a file is selected, not currently processing, and hasn't been processed yet
    if (file && !isProcessing && !processedFile) {
      processFile();
    }
  }, [file, isProcessing, processedFile, processFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".epub")) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setProcessedFile(null); // Crucial: Reset processedFile when a new file is selected
        setLogs([]); // Clear logs for new file selection
        setProgress(0);
        appendLog(`File selected: ${selectedFile.name}`);
      } else {
        toast.error("Please select a valid .epub file.");
        event.target.value = ""; // Clear the input
      }
    }
  };

  const downloadFile = () => {
    if (!processedFile || !fileName) return;
    const url = URL.createObjectURL(processedFile);
    const a = document.createElement("a");
    a.href = url;
    const newFileName = fileName.replace(".epub", `_optimized.epub`);
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    appendLog(`Downloaded ${newFileName}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">YePA - ePUB Optimizer</CardTitle>
        <CardDescription>Select a template, upload an .epub file, and download the optimized version.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="template">1. Template Selection</Label>
          <Select value={template} onValueChange={setTemplate} disabled={isProcessing}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pass-through">Pass-through</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">2. Upload EPUB File</Label>
          <Input id="file-upload" type="file" accept=".epub" onChange={handleFileChange} disabled={isProcessing} />
        </div>

        {(isProcessing || logs.length > 0) && (
          <div className="space-y-2">
            <Label>3. Status</Label>
            {isProcessing && <Progress value={progress} className="w-full" />}
            <div ref={logContainerRef} className="h-48 overflow-y-auto bg-muted p-2 rounded-md text-sm font-mono">
              {logs.map((log, index) => (
                <p key={index}>{log}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        {processedFile && (
          <div className="w-full space-y-2">
            <Label>4. Download</Label>
            <Button onClick={downloadFile} className="w-full">
              Download Processed File
            </Button>
          </div>
        )}
        <div className="w-full">
          <MadeWithDyad />
        </div>
      </CardFooter>
    </Card>
  );
};

export default ZipProcessor;