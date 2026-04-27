import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

interface CodeBlockProps {
  language: string;
  code: string;
  isRTL: boolean;
}

/**
 * Single source of truth for fenced code blocks in the reading components.
 * - Prism syntax highlighting with theme that follows app dark/light mode.
 * - Copy-to-clipboard button with a confirmation tick that lasts ~1.6s.
 * - Language tag in the leading corner so readers can see what's highlighted.
 * - Always rendered LTR even inside RTL articles, since code is LTR by nature.
 */
export function CodeBlock({ language, code, isRTL }: CodeBlockProps) {
  const { theme } = useAppStore();
  const isDark = theme === "dark";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable: silently no-op */
    }
  };

  return (
    <div
      dir="ltr"
      className="not-prose relative my-4 rounded-lg border border-border bg-muted/40 overflow-hidden group"
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/60 text-[11px] font-mono text-muted-foreground">
        <span className="uppercase tracking-wide">{language || "text"}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={isRTL ? "نسخ الكود" : "Copy code"}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-foreground/60 hover:text-foreground hover:bg-background/80 transition-default"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-[10px]">{isRTL ? "تمّ" : "Copied"}</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="text-[10px]">{isRTL ? "نسخ" : "Copy"}</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "0.875rem 1rem",
          background: "transparent",
          fontSize: "0.8em",
          lineHeight: 1.55,
        }}
        wrapLongLines={false}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
