"use client";

import React, { useState, useCallback } from "react";
import { ZipReader, BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";

const ZipProcessor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [outputZipBlob, setOutputZipBlob] = useState<Blob | null>(null);
  const [outputFileName, setOutputFileName] = useState("");
  const [processedFileNames, setProcessedFileNames] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setOutputZipBlob(null); // Reset output when new file is selected
      setProcessedFileNames([]);
      setProgress(0);
      setStatusMessage("");
    }
  };

  const processZip = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Please select a zip file first.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatusMessage("Starting processing...");
    setProcessedFileNames([]);
    setOutputZipBlob(null);

    try {
      const reader = new ZipReader(new BlobReader(selectedFile));
      const entries = await reader.getEntries();
      const filesToProcess: { name: string; blob: Blob }[] = [];
      const totalEntries = entries.length;
      let extractedCount = 0;

      setStatusMessage(`Extracting ${totalEntries} files...`);
      for (const entry of entries) {
        if (!entry.directory) {
          const blob = await entry.getData(new BlobWriter());
          filesToProcess.push({ name: entry.filename, blob });
          extractedCount++;
          setProcessedFileNames((prev) => [...prev, entry.filename]);
          setProgress(Math.floor((extractedCount / totalEntries) * 50)); // Update progress for extraction phase
        }
      }
      await reader.close();

      setStatusMessage(`Re-zipping ${filesToProcess.length} files...`);
      const writer = new ZipWriter(new BlobWriter("application/zip"));
      const totalFilesToRezip = filesToProcess.length;
      let addedCount = 0;

      for (const file of filesToProcess) {
        // This is where the "per-file-processor" logic would go.
        // For now, it's a pass-through, so we just add the original blob.
        await writer.add(file.name, new BlobReader(file.blob));
        addedCount++;
        setProgress(50 + Math.floor((addedCount / totalFilesToRezip) * 50)); // Update progress for re-zipping phase
      }
      const newZipBlob = await writer.close();

      const newFileName = selectedFile.name.replace(/\.zip$/, "") + "_processed.zip";
      setOutputZipBlob(newZipBlob);
      setOutputFileName(newFileName);
      setProgress(100);
      setStatusMessage("Processing complete! Your file is ready for download.");
      toast.success("Zip file processed successfully!");
    } catch (error) {
      console.error("Error processing zip:", error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Failed to process zip file.");
      setOutputZipBlob(null);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  const handleDownload = () => {
    if (outputZipBlob && outputFileName) {
      const url = URL.createObjectURL(outputZipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.info("Download started.");
    } else {
      toast.error("No file to download.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 p-6 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">Zip File Processor</CardTitle>
        <CardDescription className="text-center text-gray-600 mt-2">
          Upload a zip file, process its contents (pass-through for now), and download the new zip.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div>
          <Label htmlFor="zip-file" className="text-lg font-medium mb-2 block">
            1. Upload your zip file
          </Label>
          <Input
            id="zip-file"
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="file:text-primary file:font-medium"
          />
          {selectedFile && (
            <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name}</p>
          )}
        </div>

        {/* Process Button */}
        <Button
          onClick={processZip}
          disabled={!selectedFile || isProcessing}
          className="w-full py-2 text-lg"
        >
          {isProcessing ? "Processing..." : "2. Process Zip File"}
        </Button>

        {/* Status Area */}
        <div className="space-y-2">
          <Label className="text-lg font-medium block">3. Status</Label>
          <Progress value={progress} className="w-full h-3" />
          <p className="text-sm text-gray-700 mt-2">{statusMessage}</p>
          {processedFileNames.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
              <p className="font-medium text-sm mb-1">Files processed:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {processedFileNames.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Download Area */}
        <div>
          <Label className="text-lg font-medium mb-2 block">4. Download Processed File</Label>
          <Button
            onClick={handleDownload}
            disabled={!outputZipBlob || isProcessing}
            className="w-full py-2 text-lg"
          >
            Download {outputFileName || "Processed Zip"}
          </Button>
          {!outputZipBlob && !isProcessing && selectedFile && (
            <p className="text-sm text-gray-500 mt-2">Processed file will appear here.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <MadeWithDyad />
      </CardFooter>
    </Card>
  );
};

export default ZipProcessor;