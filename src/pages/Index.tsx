"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { unzipEpub } from "../lib/unzip";
import { applyTemplate } from "../lib/template-applier";
import { zipFileContents } from "../lib/zip";
import { templates } from "../lib/templates";
import { resizeImages } from "../lib/resize";

export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [log, setLog] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates[0].name
  );
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedFilename, setProcessedFilename] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setLog(`Selected file: ${file.name}`);
      setProgress(0);
      setProcessedBlob(null); // Reset previous results
      setProcessedFilename("");
    }
  };

  const appendLog = (message: string) => {
    setLog((prevLog) => `${prevLog}\n${message}`);
  };

  const processEpub = async (file: File, templateName: string) => {
    setIsProcessing(true);
    setProcessedBlob(null);
    setProcessedFilename("");
    setLog(`Starting processing with template: ${templateName}...`);
    setProgress(0);

    const currentTemplate = templates.find((t) => t.name === templateName);
    if (!currentTemplate) {
      appendLog(`Error: Template ${templateName} not found.`);
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Unzip (0-25%)
      let entries = await unzipEpub(file, appendLog, (p) =>
        setProgress(p * 0.25)
      );

      // 2. Apply Template (25-50%)
      let modifiedEntries = await applyTemplate(
        entries,
        currentTemplate,
        appendLog,
        (p) => setProgress(25 + p * 0.25)
      );

      // 3. Resize Images (50-75%)
      const { maxWidth, maxHeight } = currentTemplate;
      modifiedEntries = await resizeImages(
        modifiedEntries,
        maxWidth,
        maxHeight,
        appendLog,
        (p) => setProgress(50 + p * 0.25)
      );

      // 4. Zip (75-100%)
      const finalBlob = await zipFileContents(modifiedEntries, appendLog, (p) =>
        setProgress(75 + p * 0.25)
      );

      // 5. Set blob for download
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
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">EPUB Processor</h1>
      <div className="grid w-full items-center gap-2 mb-4">
        <input
          id="epub-file"
          type="file"
          accept=".epub"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Select
          onValueChange={setSelectedTemplate}
          defaultValue={selectedTemplate}
          disabled={isProcessing}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.name} value={template.name}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => selectedFile && processEpub(selectedFile, selectedTemplate)}
          disabled={!selectedFile || isProcessing}
        >
          {isProcessing ? "Processing..." : "Process EPUB"}
        </Button>
        {processedBlob && !isProcessing && (
          <Button onClick={handleDownload} variant="secondary">
            Download File
          </Button>
        )}
      </div>
      {isProcessing && (
        <div className="w-full mb-4">
          <Progress value={progress} />
          <p className="text-sm text-center mt-1">{Math.round(progress)}%</p>
        </div>
      )}
      <Textarea
        value={log}
        readOnly
        className="w-full h-64 font-mono text-xs"
        placeholder="Logs will appear here..."
      />
    </div>
  );
}