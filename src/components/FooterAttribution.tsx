import { GeminiLogo } from './logos/GeminiLogo';
import { DyadLogo } from './logos/DyadLogo';
import { ZipJsLogo } from './logos/ZipJsLogo';
import { FontAwesomeLogo } from './logos/FontAwesomeLogo';

export const FooterAttribution = () => {
  return (
    <div className="p-4 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Made with AI and Humans
      </p>
      <div className="flex justify-center items-center space-x-6 text-gray-500 dark:text-gray-400">
        <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" aria-label="Google Gemini" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <GeminiLogo className="h-6 w-auto" />
        </a>
        <a href="https://www.dyad.sh/" target="_blank" rel="noopener noreferrer" aria-label="Dyad" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <DyadLogo className="h-6 w-auto" />
        </a>
        <a href="https://gildas-lormeau.github.io/zip.js/" target="_blank" rel="noopener noreferrer" aria-label="zip.js" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <ZipJsLogo className="h-6 w-auto" />
        </a>
        <a href="https://fontawesome.com/" target="_blank" rel="noopener noreferrer" aria-label="Font Awesome" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <FontAwesomeLogo className="h-6 w-auto" />
        </a>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        and many more.
      </p>
    </div>
  );
};