import { useState } from 'react';
import JSZip from 'jszip';

export function useEpubProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const processEpub = async (file: File) => {
    setIsProcessing(true);
    setProcessedBlob(null);
    setProcessingLog([]);
    setError(null);
    setProgress(0);

    try {
      const zip = await JSZip.loadAsync(file);
      const newZip = new JSZip();
      const log: string[] = [];

      const filesToProcess = Object.keys(zip.files).filter(
        (fileName) => !zip.files[fileName].dir
      );
      const totalFiles = filesToProcess.length;

      for (let i = 0; i < totalFiles; i++) {
        const fileName = filesToProcess[i];
        const fileData = await zip.files[fileName].async('string');
        // In a real scenario, you would process the file content here.
        // For this example, we'll just log and copy it.
        const updatedLog = `Processed: ${fileName}`;
        log.push(updatedLog);
        setProcessingLog((prevLog) => [...prevLog, updatedLog]);
        newZip.file(fileName, fileData);

        // Update progress
        const currentProgress = Math.round(((i + 1) / totalFiles) * 100);
        setProgress(currentProgress);
      }

      const blob = await newZip.generateAsync({ type: 'blob' });
      setProcessedBlob(blob);
    } catch (e) {
      console.error(e);
      setError('Failed to process the EPUB file. Is it a valid .epub file?');
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, processedBlob, processingLog, error, processEpub, progress };
}