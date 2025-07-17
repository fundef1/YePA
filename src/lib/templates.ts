export interface Replacement {
  file: string;
  find: RegExp;
  replace: string;
}

export interface Template {
  name: string;
  description: string;
  replacements: Replacement[];
  filesToRemove: string[];
  maxWidth: number;
  maxHeight: number;
  grayscaleLevels: number;
}

export const templates: Template[] = [
    {
    name: "NST",
    description: "NOOK Simple Touch with image resizing (600x800) and 16-level grayscale.",
    replacements: [
      {
        file: "OEBPS/content.opf",
        find: /<meta name="book-type" content="comic"\/>\s*/,
        replace: "",
      },
    ],
    filesToRemove: ["oceanofpdf.com"],
    maxWidth: 600,
    maxHeight: 800,
    grayscaleLevels: 16,
  },
  {
    name: "ST",
    description: "Standard template for general use.",
    replacements: [
      {
        file: "OEBPS/content.opf",
        find: /<meta name="book-type" content="comic"\/>\s*/,
        replace: "",
      },
    ],
    filesToRemove: [],
    maxWidth: 0,
    maxHeight: 0,
    grayscaleLevels: 1024,
  },
  {
    name: "Pass-Through",
    description: "Unpack and Repack only",
    replacements: [],
    filesToRemove: [],
    maxWidth: 0,
    maxHeight: 0,
    grayscaleLevels: 0,
  },
];