import { Template, Replacement } from "./templates";
import { readBlobAsText, getTextDecoder } from "./file-utils";

/**
 * Applies a template to the EPUB entries. This involves text replacements and file removals.
 * @param entries The array of file entries from the EPUB.
 * @param template The template to apply.
 * @param appendLog A callback function to append messages to a log.
 * @param setProgress A callback function to update the progress.
 * @returns A promise that resolves to the modified array of entries.
 */
export const applyTemplate = async (
  entries: { filename: string; data: Blob }[],
  template: Template,
  appendLog: (message: string) => void,
  setProgress: (progress: number) => void
): Promise<{ filename: string; data: Blob }[]> => {
  appendLog("Applying template...");
  let modifiedEntries = [...entries];
  let processedCount = 0;
  const totalOperations =
    template.replacements.length + template.filesToRemove.length;

  // Perform text replacements
  for (const replacement of template.replacements) {
    const targetFilename = replacement.file; // Use filename directly from template
    const entryIndex = modifiedEntries.findIndex(
      (e) => e.filename === targetFilename
    );

    if (entryIndex !== -1) {
      const entry = modifiedEntries[entryIndex];
      appendLog(`Modifying ${entry.filename}...`);
      const decoder = getTextDecoder(await readBlobAsText(entry.data));
      const text = decoder.decode(await entry.data.arrayBuffer());
      const newText = text.replace(replacement.find, replacement.replace);
      const newBlob = new Blob([newText], { type: "application/xml+xhtml" });
      modifiedEntries[entryIndex] = { ...entry, data: newBlob };
    } else {
      appendLog(`Warning: File to modify not found: ${targetFilename}`);
    }
    processedCount++;
    if (totalOperations > 0) {
      setProgress((processedCount / totalOperations) * 100);
    }
  }

  // Remove specified files
  if (template.filesToRemove.length > 0) {
    modifiedEntries = modifiedEntries.filter((entry) => {
      const shouldRemove = template.filesToRemove.includes(entry.filename);
      if (shouldRemove) {
        appendLog(`Removing file: ${entry.filename}`);
        processedCount++;
        if (totalOperations > 0) {
          setProgress((processedCount / totalOperations) * 100);
        }
      }
      return !shouldRemove;
    });
  }

  appendLog("Template application complete.");
  return modifiedEntries;
};