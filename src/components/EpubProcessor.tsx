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

const EpubProcessor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [outputEpubBlob, setOutputEpubBlob] = useState<Blob | null>(null);
  const [outputFileName, setOutputFileName] = useState("");
  const [processedFileNames, setProcessedFileNames] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.epub')) {
        toast.error("Please select a valid EPUB file (.epub)");
        event.target.value = ''; // Clear the input
        return;
      }
      setSelectedFile(file);
      setOutputEpubBlob(null);
      setProcessedFileNames([]);
      setProgress(0);
      setStatusMessage("");
    }
  };

  // ... rest of the component remains exactly the same ...

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 p-6 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">EPUB File Processor</CardTitle>
        <CardDescription className="text-center text-gray-600 mt-2">
          Upload an EPUB file, process its contents, and download the new EPUB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div>
          <Label htmlFor="epub-file" className="text-lg font-medium mb-2 block">
            1. Upload your EPUB file
          </Label>
          <Input
            id="epub-file"
            type="file"
            accept=".epub"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="file:text-primary file:font-medium"
          />
          {selectedFile && (
            <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name}</p>
          )}
        </div>

        {/* ... rest of the JSX remains exactly the same ... */}
      </CardContent>
      <CardFooter className="flex justify-center">
        <MadeWithDyad />
      </CardFooter>
    </Card>
  );
};

export default EpubProcessor;