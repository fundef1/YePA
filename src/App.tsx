import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";
import { TemplateSelect } from "./components/TemplateSelect";
import { unzipFile } from "./lib/unzip";
import { zipFileContents } from "./lib/zip";
import {
  initializeVips,
  scaleImages,
  grayscaleImages,
} from "./lib/image-processing";

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);

  const appendLog = (message: string) => {
    console.log(message);
    setLog((prevLog) => [...prevLog, message]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setProcessedFile(null);
      setLog([]);
      setProgress(0);
    }
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
  };

  const handleFileProcessing = async () => {
    if (!selectedFile || !selectedTemplate) {
      appendLog("Please select a file and a template first.");
      return;
    }

    setIsProcessing(true);
    setProcessedFile(null);
    setLog([]);
    setProgress(0);

    try {
      let entries = await unzipFile(selectedFile, appendLog, setProgress); // 0-50%

      if (selectedTemplate === "nst") {
        // No image processing for NST, just re-zip
        appendLog(
          "Template 'NST' selected. No image processing will be applied."
        );
      } else if (selectedTemplate === "nst-g") {
        appendLog(
          "Template 'NST/G' selected. Scaling and grayscaling images..."
        );
        // Progress will be reset and run from 0-100 for each step here, then jump to 50% for zipping.
        await initializeVips(appendLog, setProgress);
        let scaledEntries = await scaleImages(
          entries,
          appendLog,
          setProgress,
          600,
          800
        );
        entries = await grayscaleImages(
          scaledEntries,
          appendLog,
          setProgress,
          32
        );
      } else {
        appendLog(`Unknown template: ${selectedTemplate}`);
        throw new Error(`Unknown template: ${selectedTemplate}`);
      }

      const zippedBlob = await zipFileContents(entries, appendLog, setProgress); // 50-100%
      setProcessedFile(zippedBlob);
      appendLog("File processing complete.");
    } catch (error) {
      console.error(error);
      appendLog(
        `An error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleDownload = () => {
    if (processedFile && selectedFile) {
      const url = URL.createObjectURL(processedFile);
      const a = document.createElement("a");
      a.href = url;
      const name = selectedFile.name.replace(".epub", "");
      a.download = `${name}_${selectedTemplate}.epub`;
      document.body.appendChild(a);
a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          EPUB Processor
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <Input
              id="epub-file"
              type="file"
              onChange={handleFileChange}
              accept=".epub"
              className="sm:col-span-2"
              disabled={isProcessing}
            />
            <TemplateSelect
              onTemplateChange={handleTemplateChange}
              disabled={isProcessing}
            />
          </div>

          <Button
            onClick={handleFileProcessing}
            disabled={!selectedFile || !selectedTemplate || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Process File"}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center">{Math.round(progress)}%</p>
            </div>
          )}

          {log.length > 0 && (
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-900 rounded-md p-4 overflow-y-auto text-sm font-mono">
              {log.map((message, index) => (
                <div key={index}>{message}</div>
              ))}
            </div>
          )}

          {processedFile && (
            <Button onClick={handleDownload} className="w-full">
              Download Processed EPUB
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;