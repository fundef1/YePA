"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  Download,
  FileArchive,
  Loader2,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { unzipEpub } from "@/lib/unzip";
import { repackEpub } from "@/lib/repack";
import { EpubFile } from "@/types/epub";

export default function Index() {
  const [originalEpubFiles, setOriginalEpubFiles] = useState<EpubFile[] | null>(
    null
  );
  const [repackedEpubBlob, setRepackedEpubBlob] = useState<Blob | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [fileName, setFileName] = useState("");

  const appendLog = useCallback((message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleClear();
    setIsProcessing(true);
    setFileName(file.name);
    appendLog(`Selected file: ${file.name}`);

    try {
      const files = await unzipEpub(file, appendLog, setProgress);
      setOriginalEpubFiles(files);
      appendLog(`Found ${files.length} files in the EPUB.`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      appendLog(`Error processing file: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleRepack = async () => {
    if (!originalEpubFiles) return;

    setIsProcessing(true);
    setRepackedEpubBlob(null);
    appendLog("--- Starting Repack ---");

    try {
      const blob = await repackEpub(originalEpubFiles, appendLog, setProgress);
      setRepackedEpubBlob(blob);
      appendLog("EPUB repacked successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      appendLog(`Error repacking EPUB: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!repackedEpubBlob) return;
    const url = URL.createObjectURL(repackedEpubBlob);
    const a = document.createElement("a");
    a.href = url;
    const newFileName = fileName.replace(".epub", "_repacked.epub");
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    appendLog(`Downloaded ${newFileName}`);
  };

  const handleClear = () => {
    setOriginalEpubFiles(null);
    setRepackedEpubBlob(null);
    setProgress(0);
    setLogs([]);
    setIsProcessing(false);
    setIsVerifying(false);
    setFileName("");
    const fileInput = document.getElementById("epub-file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleVerify = async () => {
    if (!repackedEpubBlob || !originalEpubFiles) {
      appendLog("Cannot verify. Repacked EPUB or original files are missing.");
      return;
    }

    setIsVerifying(true);
    setProgress(0);
    appendLog("--- Starting Verification ---");

    try {
      const repackedFile = new File([repackedEpubBlob], "repacked.epub", {
        type: "application/epub+zip",
      });

      appendLog("Unzipping repacked EPUB for verification...");
      const repackedFiles = await unzipEpub(
        repackedFile,
        (msg) => appendLog(`[Verify] ${msg}`),
        setProgress
      );

      const originalFilenames = new Set(
        originalEpubFiles.map((f) => f.filename)
      );
      const repackedFilenames = new Set(repackedFiles.map((f) => f.filename));

      appendLog(`Original file count: ${originalFilenames.size}`);
      appendLog(`Repacked file count: ${repackedFilenames.size}`);

      const missingFiles: string[] = [];
      for (const filename of originalFilenames) {
        if (!repackedFilenames.has(filename)) {
          missingFiles.push(filename);
        }
      }

      const extraFiles: string[] = [];
      for (const filename of repackedFilenames) {
        if (!originalFilenames.has(filename)) {
          extraFiles.push(filename);
        }
      }

      if (missingFiles.length === 0 && extraFiles.length === 0) {
        appendLog("✅ Verification successful! All files match.");
      } else {
        if (missingFiles.length > 0) {
          appendLog(
            `❌ Found ${missingFiles.length} missing file(s) in the repacked EPUB:`
          );
          missingFiles.forEach((file) => appendLog(`- ${file}`));
        }
        if (extraFiles.length > 0) {
          appendLog(
            `Found ${extraFiles.length} extra file(s) in the repacked EPUB:`
          );
          extraFiles.forEach((file) => appendLog(`- ${file}`));
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      appendLog(`Verification failed: ${errorMessage}`);
    } finally {
      setIsVerifying(false);
      setProgress(0);
      appendLog("--- Verification Complete ---");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">EPUB Repacker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label htmlFor="epub-file" className="font-medium">
                Select EPUB file
              </label>
              <Input
                id="epub-file"
                type="file"
                accept=".epub"
                onChange={handleFileChange}
                disabled={isProcessing || isVerifying}
              />
            </div>

            {fileName && (
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  onClick={handleRepack}
                  disabled={!originalEpubFiles || isProcessing || isVerifying}
                >
                  {isProcessing && !repackedEpubBlob ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileArchive className="mr-2 h-4 w-4" />
                  )}
                  Repack EPUB
                </Button>

                {repackedEpubBlob && (
                  <>
                    <Button
                      onClick={handleDownload}
                      disabled={isProcessing || isVerifying}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Repacked EPUB
                    </Button>
                    <Button
                      onClick={handleVerify}
                      disabled={isProcessing || isVerifying}
                      variant="outline"
                    >
                      {isVerifying ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Verify
                    </Button>
                  </>
                )}

                <Button
                  onClick={handleClear}
                  variant="destructive"
                  disabled={isProcessing || isVerifying}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            )}

            {(isProcessing || isVerifying || progress > 0) && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  {isVerifying
                    ? "Verifying..."
                    : isProcessing
                    ? "Processing..."
                    : ""}
                </p>
              </div>
            )}

            {logs.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Logs</h3>
                <ScrollArea className="h-48 w-full rounded-md border p-4">
                  {logs.map((log, index) => (
                    <p key={index} className="text-sm font-mono">
                      {log}
                    </p>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}