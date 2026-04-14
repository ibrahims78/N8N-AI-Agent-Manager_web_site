import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { theme } = useAppStore();
  const isDark = theme === "dark";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
          const match = /language-(\w+)/.exec(className ?? "");
          const codeString = String(children).replace(/\n$/, "");

          if (!inline && match) {
            return (
              <CodeBlock
                language={match[1] ?? "text"}
                code={codeString}
                isDark={isDark}
              />
            );
          }

          return (
            <code
              className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[0.8em] font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },

        h1({ children }) {
          return <h1 className="text-xl font-bold mt-3 mb-2 text-foreground">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mt-2.5 mb-1.5 text-foreground">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mt-2 mb-1 text-foreground">{children}</h3>;
        },

        p({ children }) {
          return <p className="leading-relaxed mb-2 last:mb-0">{children}</p>;
        },

        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-1 ps-2">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-1 ps-2">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-sm leading-relaxed">{children}</li>;
        },

        blockquote({ children }) {
          return (
            <blockquote className="border-s-2 border-accent/50 bg-accent/5 ps-3 py-1 my-2 rounded-e-lg italic text-muted-foreground text-sm">
              {children}
            </blockquote>
          );
        },

        table({ children }) {
          return (
            <div className="overflow-auto my-2 rounded-lg border border-border">
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-muted">{children}</thead>;
        },
        tbody({ children }) {
          return <tbody className="divide-y divide-border">{children}</tbody>;
        },
        tr({ children }) {
          return <tr className="hover:bg-muted/50 transition-colors">{children}</tr>;
        },
        th({ children }) {
          return <th className="px-3 py-2 text-start font-semibold text-foreground">{children}</th>;
        },
        td({ children }) {
          return <td className="px-3 py-2 text-muted-foreground">{children}</td>;
        },

        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:text-accent/80 inline-flex items-center gap-0.5 transition-colors"
            >
              {children}
              <ExternalLink size={10} className="shrink-0" />
            </a>
          );
        },

        hr() {
          return <hr className="my-3 border-border" />;
        },

        strong({ children }) {
          return <strong className="font-semibold text-foreground">{children}</strong>;
        },

        em({ children }) {
          return <em className="italic text-muted-foreground">{children}</em>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function CodeBlock({ language, code, isDark }: { language: string; code: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <CheckCircle2 size={12} className="text-emerald-500" />
          ) : (
            <Copy size={12} />
          )}
          {copied ? "تم النسخ!" : "نسخ"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.75rem",
          maxHeight: "320px",
          background: "transparent",
        }}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
