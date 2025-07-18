# YePA

*inspired by kiki-le-singe's epub-optimizer (not as fancy though)*

It processes EPUB files entirely in-browser - patience, young grasshopper.
* unzips ePUB
* scales large images down to screen size
* reduces to grayscale levels of device
* zips the ePUB up again

Available profiles:
1. NST/G (600x800, 16)
2. Kobo (, 16)
3. Remarkable (,256)
4. pass-through (0x0, 0)

Uses a.o.
* @zip.js/zip.js for in-browser ePUB (un)packing
* Font Awesome 
* many other bits sucked into Google's Gemini model
built with dyad