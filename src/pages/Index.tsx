"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { unzipFileContents } from "@/lib/unzip";
import { zipFileContents } from "@/lib/zip";
import { saveAs } from "file-saver";
import { Switch } from "@/components/ui/switch";
import { processImage } from "@/lib/imageProcessor";
import { configureZipJs } from "@/lib/zip-config";

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [unzippedContents, setUnzippedContents] = useState<{ filename: string; data: Blob }[] | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [log, setLog] = useState<string[]>([]);

  // Image processing state
  const [maxWidth, setMaxWidth] = useState<number>(1024);
  const [maxHeight, setMaxHeight] = useState<number>(1024);
  const [grayscaleEnabled, setGrayscaleEnabled] = useState<boolean>(false);
  const [grayscaleLevels, setGrayscaleLevels] = useState<number>(16);

  // Configure zip.js on component mount
  useEffect(() => {
    configureZipJs();
  }, []);

  const appendLog = (message: string) => {
    console.log(message);
    setLog((prev) => [...prev, message]);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLog([]);
    setProgress(0);
    setUnzippedContents(null);
    appendLog(`Selected file: ${selectedFile.name}`);

    try {
      const contents = await unzipFileContents(selectedFile, appendLog, setProgress);
      setUnzippedContents(contents);
      appendLog("File unzipped successfully. Ready to repack.");
    } catch (error) {
      appendLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleRepack = async () => {
    if (!unzippedContents || !file) return;

    setLog([]);
    setProgress(0);
    appendLog("Starting repackaging process...");

    try {
      appendLog("Processing images...");
      const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif"]);
      const processedContents = await Promise.all(
        unzippedContents.map(async (entry) => {
          const fileExtension = entry.filename.toLowerCase().substring(entry.filename.lastIndexOf("."));
          if (imageExtensions.has(fileExtension)) {
            appendLog(`Processing image: ${entry.filename}`);
            try {
              const processedData = await processImage(entry.data, {
                resize: { maxWidth, maxHeight },
                gray: grayscaleEnabled ? { numLevels: grayscaleLevels } : undefined,
              });
              appendLog(`Finished processing: ${entry.filename}`);
              return { ...entry, data: processedData };
            } catch (error) {
              appendLog(`Error processing ${entry.filename}: ${error}`);
              return entry; // return original on error
            }
          }
          return entry;
        })
      );
      appendLog("Image processing complete.");

      const epubBlob = await zipFileContents(processedContents, appendLog, setProgress);
      appendLog(`Repackaging complete. Blob created with size: ${epubBlob.size} bytes, type: ${epubBlob.type}.`);
      
      if (epubBlob.size === 0) {
        appendLog("Error: The created EPUB file is empty. Aborting download.");
        return;
      }

      appendLog("Triggering download...");
      saveAs(epubBlob, `repacked-${file.name}`);
      appendLog("Download should have started.");
      setProgress(100);
    } catch (error) {
      appendLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>EPUB Repacker</CardTitle>
          <CardDescription>
            Select an EPUB file, adjust image processing options, and repack it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">1. Select EPUB File</Label>
            <Input id="file-upload" type="file" accept=".epub" onChange={handleFileChange} />
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-lg font-medium">2. Image Processing Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxWidth">Max Width</Label>
                <Input id="maxWidth" type="number" value={maxWidth} onChange={(e) => setMaxWidth(Math.max(1, parseInt(e.target.value, 10) || 1))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxHeight">Max Height</Label>
                <Input id="maxHeight" type="number" value={maxHeight} onChange={(e) => setMaxHeight(Math.max(1, parseInt(e.targe.value, 10) || 1))} />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="grayscale" checked={grayscaleEnabled} onCheckedChange={setGrayscaleEnabled} />
              <Label htmlFor="grayscale">Enable Grayscale</Label>
            </div>
            {grayscaleEnabled && (
              <div className="space-y-2">
                <Label htmlFor="grayscaleLevels">Grayscale Levels</Label>
                <Input id="grayscaleLevels" type="number" value={grayscaleLevels} onChange={(e) => setGrayscaleLevels(Math.max(2, parseInt(e.target.value, 10) || 2))} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>3. Repack File</Label>
            <Button onClick={handleRepack} disabled={!unzippedContents} className="w-full">
              Repack EPUB
            </Button>
          </div>

          {progress > 0 && (
            <div className="space-y-2">
              <Label>Progress</Label>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
        {log.length > 0 && (
          <CardFooter>
            <div className="w-full space-y-2">
              <Label>Log</Label>
              <div className="w-full h-40 bg-muted rounded-md p-2 text-xs font-mono overflow-y-auto">
                {log.map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}