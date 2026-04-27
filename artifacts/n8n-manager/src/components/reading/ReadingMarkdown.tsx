import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";
import { CodeBlock } from "./CodeBlock";
import { AnchorHeading } from "./AnchorHeading";

interface ReadingMarkdownProps {
  source: string;
  isRTL: boolean;
}

/**
 * Long-form markdown renderer used by `pages/guides.tsx` and the docs viewer
 * inside `pages/nodes-catalog.tsx`. Wraps ReactMarkdown with:
 *
 * - GitHub-flavoured markdown (tables, task lists, strikethrough, autolinks).
 * - `<AnchorHeading>` for h1/h2/h3, which gives every heading a stable
 *   slug-based `id` plus a hover "copy link" button.
 * - `<CodeBlock>` for fenced code blocks, with Prism syntax highlighting and
 *   a copy-to-clipboard button.
 *
 * Container styling (`prose`, fonts, RTL spacing) is intentionally left to the
 * caller so existing zoom logic in `guides.tsx` keeps working unchanged.
 */
export function ReadingMarkdown({ source, isRTL }: ReadingMarkdownProps) {
  const components = useMemo<Components>(
    () => ({
      h1: ({ children }) => (
        <AnchorHeading level={1} isRTL={isRTL}>
          {children}
        </AnchorHeading>
      ),
      h2: ({ children }) => (
        <AnchorHeading level={2} isRTL={isRTL}>
          {children}
        </AnchorHeading>
      ),
      h3: ({ children }) => (
        <AnchorHeading level={3} isRTL={isRTL}>
          {children}
        </AnchorHeading>
      ),
      code({
        inline,
        className,
        children,
        ...props
      }: {
        inline?: boolean;
        className?: string;
        children?: React.ReactNode;
      }) {
        const match = /language-(\w+)/.exec(className ?? "");
        const codeString = String(children).replace(/\n$/, "");
        if (!inline && match) {
          return (
            <CodeBlock
              language={match[1] ?? "text"}
              code={codeString}
              isRTL={isRTL}
            />
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }),
    [isRTL],
  );

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  );
}
