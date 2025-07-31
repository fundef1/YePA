import { describe, it, expect, vi } from 'vitest';
import { applyTemplate } from './template-applier';
import type { Template } from './templates';

// Mock file-utils since they deal with Blob and TextDecoder
vi.mock('./file-utils', () => ({
  readBlobAsText: vi.fn(async (blob) => new TextDecoder().decode(await blob.arrayBuffer())),
  getTextDecoder: vi.fn(() => new TextDecoder()),
}));

describe('applyTemplate', () => {
  const mockAppendLog = vi.fn();
  const mockSetProgress = vi.fn();

  const baseEntries = [
    { filename: 'OEBPS/content.opf', data: new Blob(['<meta name="book-type" content="comic"/> some content']) },
    { filename: 'file-to-keep.txt', data: new Blob(['keep me']) },
    { filename: 'file-to-remove.txt', data: new Blob(['remove me']) },
  ];

  it('should perform text replacements correctly', async () => {
    const template: Template = {
      name: 'Test',
      description: '',
      image: '',
      replacements: [
        {
          file: 'OEBPS/content.opf',
          find: /<meta name="book-type" content="comic"\/>\s*/,
          replace: '',
        },
      ],
      filesToRemove: [],
      maxWidth: 0,
      maxHeight: 0,
      grayscaleLevels: 0,
    };

    const modifiedEntries = await applyTemplate([...baseEntries], template, mockAppendLog, mockSetProgress);
    
    const modifiedEntry = modifiedEntries.find(e => e.filename === 'OEBPS/content.opf');
    const text = await modifiedEntry?.data.text();

    expect(text).toBe('some content');
    expect(mockAppendLog).toHaveBeenCalledWith('Modifying OEBPS/content.opf...');
  });

  it('should remove specified files', async () => {
    const template: Template = {
      name: 'Test',
      description: '',
      image: '',
      replacements: [],
      filesToRemove: ['file-to-remove.txt'],
      maxWidth: 0,
      maxHeight: 0,
      grayscaleLevels: 0,
    };

    const modifiedEntries = await applyTemplate([...baseEntries], template, mockAppendLog, mockSetProgress);

    expect(modifiedEntries.some(e => e.filename === 'file-to-remove.txt')).toBe(false);
    expect(modifiedEntries.length).toBe(2);
    expect(mockAppendLog).toHaveBeenCalledWith('Removing file: file-to-remove.txt');
  });
});