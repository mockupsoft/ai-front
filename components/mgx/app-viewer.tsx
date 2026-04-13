"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppViewerFile {
  name: string;
  content: string;
  type?: "html" | "css" | "js" | "other";
}

interface AppViewerProps {
  files?: AppViewerFile[];
  activeFile?: string;
  className?: string;
}

// Clean JavaScript code to make it browser-compatible
function cleanJsForBrowser(code: string): string {
  let cleaned = code;
  
  // Remove all require() statements (various patterns)
  cleaned = cleaned.replace(/(?:const|let|var)\s+[\w{}\s,]+\s*=\s*require\s*\([^)]+\)\s*;?/g, '// [removed require statement]');
  cleaned = cleaned.replace(/require\s*\(\s*['"][^'"]+['"]\s*\)/g, '{}');
  
  // Remove module.exports
  cleaned = cleaned.replace(/module\.exports\s*=\s*[^;]+;?/g, '// [removed module.exports]');
  cleaned = cleaned.replace(/exports\.\w+\s*=\s*[^;]+;?/g, '// [removed exports]');
  
  // Remove import statements  
  cleaned = cleaned.replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '// [removed import]\n');
  cleaned = cleaned.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?\s*/g, '// [removed import]\n');
  cleaned = cleaned.replace(/import\s+['"][^'"]+['"];?\s*/g, '// [removed import]\n');
  
  // Remove export statements (keep the actual code)
  cleaned = cleaned.replace(/export\s+default\s+/g, '');
  cleaned = cleaned.replace(/export\s+(?=const|let|var|function|class|async)/g, '');
  
  // Remove Node.js specific globals usage
  cleaned = cleaned.replace(/process\.env\.\w+/g, '""');
  cleaned = cleaned.replace(/__dirname/g, '"."');
  cleaned = cleaned.replace(/__filename/g, '"script.js"');
  
  // Remove test framework calls (Jest, Mocha, etc.)
  cleaned = cleaned.replace(/(?:describe|test|it|beforeAll|beforeEach|afterAll|afterEach|expect)\s*\([^]*?\)\s*;?\s*/gm, '// [removed test code]\n');
  
  // Convert arrow functions to regular functions for broader compatibility
  // Pattern: , () => { or , (args) => { (callback in method calls)
  cleaned = cleaned.replace(/,\s*\(\s*\)\s*=>\s*\{/g, ', function() {');
  cleaned = cleaned.replace(/,\s*\(([^)]+)\)\s*=>\s*\{/g, ', function($1) {');
  // Pattern: = () => { (variable assignment)
  cleaned = cleaned.replace(/=\s*\(\s*\)\s*=>\s*\{/g, '= function() {');
  cleaned = cleaned.replace(/=\s*\(([^)]+)\)\s*=>\s*\{/g, '= function($1) {');
  // Pattern: => at the start of expression (like in array methods)
  cleaned = cleaned.replace(/\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)\s*=>\s*\{/g, '(function($1) {');
  cleaned = cleaned.replace(/\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)\s*=>\s*([^{;\n]+)/g, '(function($1) { return $2; })');
  
  return cleaned;
}

export function AppViewer({ files = [], activeFile, className }: AppViewerProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Generate HTML content from files
  const htmlContent = React.useMemo(() => {
    if (!files || files.length === 0) {
      return null;
    }

    try {
      const htmlFile = files.find(f => 
        f.name.endsWith('.html') || f.type === 'html'
      );
      // Get all CSS files
      const cssFiles = files.filter(f => 
        f.name.endsWith('.css') || f.type === 'css'
      );
      // Get all JS files (exclude test files, Node.js specific files, and Playwright/Puppeteer test files)
      const jsFiles = files.filter(f => {
        if (!f.name.endsWith('.js') && !f.name.endsWith('.jsx') && f.type !== 'js') {
          return false;
        }
        // Exclude by filename
        if (f.name.includes('test') || f.name.includes('spec') || 
            f.name.includes('node_modules') || f.name.includes('.config')) {
          return false;
        }
        // Exclude numbered script files (like script_1.js which are usually test files)
        if (/script_\d+\.js$/i.test(f.name)) {
          return false;
        }
        // Exclude by content (Playwright/Puppeteer test code, async await patterns)
        if (f.content.includes('page.goto') || f.content.includes('await page') ||
            f.content.includes('puppeteer') || f.content.includes('playwright') ||
            f.content.includes('@jest') || f.content.includes('@test')) {
          return false;
        }
        return true;
      });

      if (!htmlFile) {
        return null;
      }

      let html = htmlFile.content;
      
      // Remove external script references (we'll inject inline)
      html = html.replace(/<script\s+src=["'][^"']*["'][^>]*>\s*<\/script>/gi, '');
      
      // Remove external CSS link references (we'll inject inline)
      html = html.replace(/<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi, '');
      
      // Parse and fix all style tags - remove body centering
      html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, styleContent) => {
        // Remove body flex centering
        let fixedContent = styleContent
          .replace(/body\s*\{[^}]*display\s*:\s*flex[^}]*\}/gi, 'body { display: block !important; }')
          .replace(/body\s*\{[^}]*justify-content\s*:\s*center[^}]*\}/gi, '')
          .replace(/body\s*\{[^}]*align-items\s*:\s*center[^}]*\}/gi, '')
          .replace(/body\s*\{([^}]*)\}/gi, (_bodyMatch: string, bodyContent: string) => {
            // Remove flex centering from body
            const cleaned = bodyContent
              .replace(/display\s*:\s*flex/g, 'display: block !important')
              .replace(/justify-content\s*:\s*center/g, 'justify-content: flex-start !important')
              .replace(/align-items\s*:\s*center/g, 'align-items: stretch !important');
            return `body {${cleaned}}`;
          });
        return `<style>${fixedContent}</style>`;
      });
      
      // Inject all CSS files - override centering styles
      if (cssFiles.length > 0) {
        let allStyles = cssFiles.map(f => f.content).join('\n');
        
        // Override body centering in CSS
        allStyles = allStyles
          .replace(/body\s*\{([^}]*)\}/gi, (match, bodyContent) => {
            const cleaned = bodyContent
              .replace(/display\s*:\s*flex/g, 'display: block !important')
              .replace(/justify-content\s*:\s*center/g, 'justify-content: flex-start !important')
              .replace(/align-items\s*:\s*center/g, 'align-items: stretch !important');
            return `body {${cleaned}}`;
          })
          .replace(/\.container\s*\{([^}]*)\}/gi, (match, containerContent) => {
            const cleaned = containerContent
              .replace(/text-align\s*:\s*center/g, 'text-align: left !important')
              .replace(/justify-content\s*:\s*center/g, 'justify-content: flex-start !important')
              .replace(/align-items\s*:\s*center/g, 'align-items: stretch !important');
            return `.container {${cleaned}}`;
          })
          .replace(/\.controls\s*\{([^}]*)\}/gi, (match, controlsContent) => {
            const cleaned = controlsContent
              .replace(/justify-content\s*:\s*center/g, 'justify-content: flex-start !important')
              .replace(/align-items\s*:\s*center/g, 'align-items: stretch !important');
            return `.controls {${cleaned}}`;
          });
        
        const styleTag = `<style>\n${allStyles}\n</style>`;
        if (html.includes('</head>')) {
          html = html.replace('</head>', `${styleTag}\n</head>`);
        } else if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>\n${styleTag}`);
        } else {
          html = `<head>${styleTag}</head>\n${html}`;
        }
      }

      // CSS override script that runs after DOM loads and watches for changes
      const cssOverrideScript = `
(function() {
  function overrideCSS() {
    // Override html and body styles
    const html = document.documentElement;
    const body = document.body;
    
    if (html) {
      html.style.setProperty('height', '100%', 'important');
      html.style.setProperty('width', '100%', 'important');
      html.style.setProperty('margin', '0', 'important');
      html.style.setProperty('padding', '0', 'important');
    }
    
    if (body) {
      body.style.setProperty('display', 'block', 'important');
      body.style.setProperty('justify-content', 'flex-start', 'important');
      body.style.setProperty('align-items', 'stretch', 'important');
      body.style.setProperty('min-height', '100%', 'important');
      body.style.setProperty('height', '100%', 'important');
      body.style.setProperty('width', '100%', 'important');
      body.style.setProperty('margin', '0', 'important');
      body.style.setProperty('padding', '20px', 'important');
      body.style.setProperty('box-sizing', 'border-box', 'important');
    }
    
    // Override ALL direct children of body - force them to fill space
    const bodyChildren = Array.from(body?.children || []);
    bodyChildren.forEach((child, index) => {
      if (child instanceof HTMLElement) {
        // Force ALL direct children to fill the space
        child.style.setProperty('width', '100%', 'important');
        child.style.setProperty('max-width', '100%', 'important');
        if (index === 0) {
          child.style.setProperty('min-height', 'calc(100vh - 40px)', 'important');
          child.style.setProperty('height', 'calc(100vh - 40px)', 'important');
          child.style.setProperty('display', 'flex', 'important');
          child.style.setProperty('flex-direction', 'column', 'important');
          child.style.setProperty('justify-content', 'flex-start', 'important');
          child.style.setProperty('align-items', 'stretch', 'important');
          child.style.setProperty('margin', '0', 'important');
          child.style.setProperty('padding', '20px', 'important');
          child.style.setProperty('box-sizing', 'border-box', 'important');
        }
      }
    });
    
    // Override ALL divs - be very aggressive
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach((div) => {
      if (div instanceof HTMLElement) {
        // If it's a direct child of body or has container class, make it fill
        if (div.parentElement === body || 
            div.classList.contains('container') || 
            div.className.includes('container') ||
            div === body.firstElementChild) {
          div.style.setProperty('min-height', 'calc(100vh - 40px)', 'important');
          div.style.setProperty('height', 'calc(100vh - 40px)', 'important');
          div.style.setProperty('width', '100%', 'important');
          div.style.setProperty('display', 'flex', 'important');
          div.style.setProperty('flex-direction', 'column', 'important');
          div.style.setProperty('justify-content', 'flex-start', 'important');
          div.style.setProperty('align-items', 'stretch', 'important');
          div.style.setProperty('margin', '0', 'important');
          div.style.setProperty('box-sizing', 'border-box', 'important');
          div.style.setProperty('max-width', '100%', 'important');
          div.style.setProperty('max-height', 'calc(100vh - 40px)', 'important');
        }
        // Also override any div that might be centering content
        const computedStyle = window.getComputedStyle(div);
        if (computedStyle.justifyContent === 'center' || computedStyle.alignItems === 'center') {
          div.style.setProperty('justify-content', 'flex-start', 'important');
          div.style.setProperty('align-items', 'stretch', 'important');
        }
      }
    });
    
    // Remove any inline styles that center content - be very aggressive
    const allElements = document.querySelectorAll('*');
    allElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const style = el.style;
        const computedStyle = window.getComputedStyle(el);
        
        // Override ALL max-width constraints for all elements
        if (el !== body && el !== html) {
          style.setProperty('max-width', '100%', 'important');
        }
        
        // Override center alignment
        if (style.justifyContent === 'center' || computedStyle.justifyContent === 'center') {
          style.setProperty('justify-content', 'flex-start', 'important');
        }
        if (style.alignItems === 'center' || computedStyle.alignItems === 'center') {
          style.setProperty('align-items', 'stretch', 'important');
        }
        if (style.textAlign === 'center' || computedStyle.textAlign === 'center') {
          style.setProperty('text-align', 'left', 'important');
        }
        
        // Override body flex display
        if (style.display === 'flex' && el === body) {
          style.setProperty('display', 'block', 'important');
        }
        
        // Force width: 100% on all body children
        if (el.parentElement === body) {
          style.setProperty('width', '100%', 'important');
          style.setProperty('max-width', '100%', 'important');
        }
      }
    });
  }
  
  // Run immediately
  overrideCSS();
  
  // Run after DOM loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', overrideCSS);
  } else {
    overrideCSS();
  }
  
  // Watch for style changes using MutationObserver
  const observer = new MutationObserver(() => {
    overrideCSS();
  });
  
  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true
    });
  }
  
  // Also run after delays to catch dynamically added styles
  setTimeout(overrideCSS, 50);
  setTimeout(overrideCSS, 100);
  setTimeout(overrideCSS, 200);
  setTimeout(overrideCSS, 300);
  setTimeout(overrideCSS, 500);
  setTimeout(overrideCSS, 1000);
  setTimeout(overrideCSS, 2000);
})();
`;

      // Inject all JS files (cleaned for browser compatibility)
      if (jsFiles.length > 0) {
        const allScripts = jsFiles.map(f => {
          const cleanedCode = cleanJsForBrowser(f.content);
          return `// ${f.name}\n${cleanedCode}`;
        }).join('\n\n');
        const wrappedScript = `
try {
  ${cssOverrideScript}
  ${allScripts}
} catch (e) {
  console.warn('[App Viewer] Script error:', e.message);
}`;
        const scriptTag = `<script>\n${wrappedScript}\n</script>`;
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${scriptTag}\n</body>`);
        } else {
          html = `${html}\n${scriptTag}`;
        }
      } else {
        // Even if no JS files, inject CSS override script
        const scriptTag = `<script>\n${cssOverrideScript}\n</script>`;
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${scriptTag}\n</body>`);
        } else {
          html = `${html}\n${scriptTag}`;
        }
      }

      // Ensure DOCTYPE
      if (!html.trim().toLowerCase().startsWith('<!doctype')) {
        html = `<!DOCTYPE html>\n${html}`;
      }

      // Inject base styles to ensure content starts at top and fills the iframe
      const baseStyles = `
        <style>
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 100% !important;
            height: 100% !important;
            width: 100% !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif !important;
            background: #fff !important;
            overflow: auto !important;
            display: block !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
          }
          body {
            padding: 20px !important;
            box-sizing: border-box !important;
          }
          /* Override any body styles that center content - must be after body definition */
          body {
            display: block !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
          }
          /* Ensure main container fills the iframe */
          body > div:first-child {
            min-height: calc(100vh - 40px) !important;
            height: calc(100vh - 40px) !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
          }
          /* Override Counter app's centering - target .container class */
          body > div.container,
          body > div[class*="container"],
          body div.container {
            min-height: calc(100vh - 40px) !important;
            height: calc(100vh - 40px) !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            text-align: left !important;
          }
          /* Override .controls centering */
          .controls,
          div.controls,
          body .controls {
            display: flex !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Override ALL body flex centering */
          body {
            display: block !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
          }
          /* Override any existing style tags that center content */
          body[style*="justify-content: center"],
          body[style*="align-items: center"] {
            display: block !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
          }
        </style>
      `;
      
      // Insert base styles at the start of head (before other styles)
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>\n${baseStyles}`);
      } else if (html.includes('</head>')) {
        html = html.replace('</head>', `${baseStyles}\n</head>`);
      } else {
        // No head tag, insert after DOCTYPE
        html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n<head>${baseStyles}</head>`);
      }

      return html;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate HTML");
      return null;
    }
  }, [files]);

  React.useEffect(() => {
    // Reset error when content changes
    if (htmlContent) {
      setError(null);
    } else if (!htmlContent && files.length > 0) {
      setError("No HTML file found in project");
    }
  }, [htmlContent, files]);

  if (files.length === 0) {
    return (
      <div 
        className={cn("bg-white flex items-center justify-center", className)}
        style={{ height: '100%', width: '100%' }}
      >
        <div className="text-center text-zinc-500">
          <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">No files available for preview</p>
          <p className="text-xs mt-2 text-zinc-400">Files will appear here when the project is generated</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={cn("bg-white flex items-center justify-center", className)}
        style={{ height: '100%', width: '100%' }}
      >
        <div className="text-center text-red-600">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <p className="text-sm font-medium">Preview Error</p>
          <p className="text-xs mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("overflow-hidden bg-white", className)}
      style={{ 
        height: '100%', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0
      }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent || undefined}
        sandbox="allow-scripts allow-same-origin"
        style={{ 
          height: '100%', 
          width: '100%', 
          border: 'none',
          display: 'block',
          flex: 1,
          minHeight: 0,
          minWidth: 0
        }}
        className="bg-white"
        title="App Preview"
        onLoad={() => {
          // Force CSS override after iframe loads
          if (iframeRef.current?.contentWindow) {
            try {
              const iframeDoc = iframeRef.current.contentDocument;
              if (iframeDoc) {
                const script = iframeDoc.createElement('script');
                script.textContent = `
                  (function() {
                    function overrideCSS() {
                      const html = document.documentElement;
                      const body = document.body;
                      
                      if (html) {
                        html.style.setProperty('height', '100%', 'important');
                        html.style.setProperty('width', '100%', 'important');
                        html.style.setProperty('margin', '0', 'important');
                        html.style.setProperty('padding', '0', 'important');
                      }
                      
                      if (body) {
                        body.style.setProperty('display', 'block', 'important');
                        body.style.setProperty('justify-content', 'flex-start', 'important');
                        body.style.setProperty('align-items', 'stretch', 'important');
                        body.style.setProperty('min-height', '100%', 'important');
                        body.style.setProperty('height', '100%', 'important');
                        body.style.setProperty('width', '100%', 'important');
                        body.style.setProperty('margin', '0', 'important');
                        body.style.setProperty('padding', '20px', 'important');
                        body.style.setProperty('box-sizing', 'border-box', 'important');
                      }
                      
                      // Force ALL body children to fill space
                      const bodyChildren = Array.from(body?.children || []);
                      bodyChildren.forEach((child, index) => {
                        if (child instanceof HTMLElement) {
                          child.style.setProperty('width', '100%', 'important');
                          child.style.setProperty('max-width', '100%', 'important');
                          if (index === 0) {
                            child.style.setProperty('min-height', 'calc(100vh - 40px)', 'important');
                            child.style.setProperty('height', 'calc(100vh - 40px)', 'important');
                            child.style.setProperty('display', 'flex', 'important');
                            child.style.setProperty('flex-direction', 'column', 'important');
                            child.style.setProperty('justify-content', 'flex-start', 'important');
                            child.style.setProperty('align-items', 'stretch', 'important');
                            child.style.setProperty('margin', '0', 'important');
                            child.style.setProperty('padding', '20px', 'important');
                            child.style.setProperty('box-sizing', 'border-box', 'important');
                          }
                        }
                      });
                      
                      // Override all elements - remove centering and max-width constraints
                      const allElements = document.querySelectorAll('*');
                      allElements.forEach((el) => {
                        if (el instanceof HTMLElement && el !== body && el !== html) {
                          const computedStyle = window.getComputedStyle(el);
                          el.style.setProperty('max-width', '100%', 'important');
                          if (computedStyle.justifyContent === 'center') {
                            el.style.setProperty('justify-content', 'flex-start', 'important');
                          }
                          if (computedStyle.alignItems === 'center') {
                            el.style.setProperty('align-items', 'stretch', 'important');
                          }
                          if (computedStyle.textAlign === 'center') {
                            el.style.setProperty('text-align', 'left', 'important');
                          }
                        }
                      });
                    }
                    overrideCSS();
                    setTimeout(overrideCSS, 50);
                    setTimeout(overrideCSS, 100);
                    setTimeout(overrideCSS, 200);
                    setTimeout(overrideCSS, 500);
                    setTimeout(overrideCSS, 1000);
                  })();
                `;
                iframeDoc.body.appendChild(script);
              }
            } catch (e) {
              console.warn('Failed to inject CSS override into iframe:', e);
            }
          }
        }}
      />
    </div>
  );
}

