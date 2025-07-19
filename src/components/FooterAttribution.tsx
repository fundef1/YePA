import { Bot } from "lucide-react";
import { FontAwesomeIcon } from "./icons/FontAwesomeIcon";
import { GeminiIcon } from "./icons/GeminiIcon";

export const FooterAttribution = () => {
  return (
    <div className="p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Made with Artificially Intelligent Humans;</span>
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://gemini.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Gemini"
            className="transition-transform hover:scale-110"
          >
            <GeminiIcon className="h-6 w-6" />
          </a>
          <span title="Dyad" className="transition-transform hover:scale-110">
            <Bot className="h-6 w-6 text-gray-500" />
          </span>
          <a
            href="https://gildas-lormeau.github.io/zip.js/"
            target="_blank"
            rel="noopener noreferrer"
            title="zip.js"
            className="transition-transform hover:scale-110"
          >
            <img
              src="https://github.com/gildas-lormeau.png"
              alt="zip.js author Gildas Lormeau's GitHub avatar"
              className="h-6 w-6 rounded-full"
            />
          </a>
          <a
            href="https://fontawesome.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Font Awesome"
            className="transition-transform hover:scale-110"
          >
            <FontAwesomeIcon className="h-6 w-6 text-blue-600" />
          </a>
        </div>
        <span>... and many more.</span>
      </div>
    </div>
  );
};