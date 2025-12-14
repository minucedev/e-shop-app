// components/MarkdownText.tsx
// Simple Markdown parser without external dependencies

import React, { useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";

interface MarkdownTextProps {
  children: string;
  style?: any;
}

export const MarkdownText: React.FC<MarkdownTextProps> = React.memo(
  ({ children, style }) => {
    // Memoize parsed content to prevent re-parsing on every render
    const parsedContent = useMemo(() => parseMarkdown(children), [children]);

    return <View style={style}>{parsedContent}</View>;
  }
);

MarkdownText.displayName = "MarkdownText";

// Helper function to parse inline markdown (bold, italic, code, links)
const parseInlineMarkdown = (text: string) => {
  const parts: (string | React.ReactElement)[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Bold (**text** or __text__)
    const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
    if (boldMatch) {
      parts.push(
        <Text key={`bold-${keyIndex++}`} style={styles.bold}>
          {boldMatch[2]}
        </Text>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic (*text* or _text_)
    const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
    if (italicMatch) {
      parts.push(
        <Text key={`italic-${keyIndex++}`} style={styles.italic}>
          {italicMatch[2]}
        </Text>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline code (`code`)
    const codeMatch = remaining.match(/^`(.+?)`/);
    if (codeMatch) {
      parts.push(
        <Text key={`code-${keyIndex++}`} style={styles.inlineCode}>
          {codeMatch[1]}
        </Text>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Link ([text](url))
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      parts.push(
        <Text key={`link-${keyIndex++}`} style={styles.link}>
          {linkMatch[1]}
        </Text>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Regular text
    const nextSpecial = remaining.search(/[\*_`\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial > 0) {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    } else {
      // Special character but no match, just add it
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return <>{parts}</>;
};

// Main parsing function - parse markdown text into React elements
const parseMarkdown = (text: string) => {
  const lines = text.split("\n");
  const elements: React.ReactElement[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    // Skip empty lines
    if (line.trim() === "") {
      elements.push(<View key={`empty-${lineIndex}`} style={{ height: 8 }} />);
      lineIndex++;
      continue;
    }

    // Headers (# ## ###)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      elements.push(
        <Text
          key={`header-${lineIndex}`}
          style={[
            styles.text,
            level === 1 && styles.h1,
            level === 2 && styles.h2,
            level === 3 && styles.h3,
            level === 4 && styles.h4,
          ]}
        >
          {parseInlineMarkdown(headerText)}
        </Text>
      );
      lineIndex++;
      continue;
    }

    // Bullet list (- or *)
    const bulletMatch = line.match(/^[\s]*[-*]\s+(.+)$/);
    if (bulletMatch) {
      const bulletText = bulletMatch[1];
      elements.push(
        <View key={`bullet-${lineIndex}`} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>{parseInlineMarkdown(bulletText)}</Text>
        </View>
      );
      lineIndex++;
      continue;
    }

    // Numbered list (1. 2. 3.)
    const numberedMatch = line.match(/^[\s]*(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const number = numberedMatch[1];
      const numberedText = numberedMatch[2];
      elements.push(
        <View key={`numbered-${lineIndex}`} style={styles.listItem}>
          <Text style={styles.number}>{number}.</Text>
          <Text style={styles.text}>{parseInlineMarkdown(numberedText)}</Text>
        </View>
      );
      lineIndex++;
      continue;
    }

    // Blockquote (> text)
    const blockquoteMatch = line.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      const quoteText = blockquoteMatch[1];
      elements.push(
        <View key={`quote-${lineIndex}`} style={styles.blockquote}>
          <Text style={styles.blockquoteText}>
            {parseInlineMarkdown(quoteText)}
          </Text>
        </View>
      );
      lineIndex++;
      continue;
    }

    // Code block (```)
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      lineIndex++; // Skip opening ```
      while (
        lineIndex < lines.length &&
        !lines[lineIndex].trim().startsWith("```")
      ) {
        codeLines.push(lines[lineIndex]);
        lineIndex++;
      }
      elements.push(
        <View key={`code-${lineIndex}`} style={styles.codeBlock}>
          <Text style={styles.codeText}>{codeLines.join("\n")}</Text>
        </View>
      );
      lineIndex++; // Skip closing ```
      continue;
    }

    // Horizontal rule (---)
    if (line.trim().match(/^[-*_]{3,}$/)) {
      elements.push(<View key={`hr-${lineIndex}`} style={styles.hr} />);
      lineIndex++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <Text key={`p-${lineIndex}`} style={styles.paragraph}>
        {parseInlineMarkdown(line)}
      </Text>
    );
    lineIndex++;
  }

  return elements;
};

const styles = StyleSheet.create({
  text: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 24,
  },
  paragraph: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  h1: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    marginBottom: 12,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 14,
    marginBottom: 10,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
    marginBottom: 8,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 10,
    marginBottom: 6,
  },
  bold: {
    fontWeight: "700",
    color: "#111827",
  },
  italic: {
    fontStyle: "italic",
  },
  link: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  inlineCode: {
    backgroundColor: "#F3F4F6",
    color: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 14,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 8,
  },
  bullet: {
    color: "#2563EB",
    fontSize: 16,
    marginRight: 8,
    fontWeight: "700",
  },
  number: {
    color: "#2563EB",
    fontSize: 14,
    marginRight: 8,
    fontWeight: "600",
    minWidth: 24,
  },
  blockquote: {
    backgroundColor: "#F3F4F6",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  blockquoteText: {
    color: "#374151",
    fontStyle: "italic",
    fontSize: 15,
    lineHeight: 22,
  },
  codeBlock: {
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  codeText: {
    color: "#F9FAFB",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  hr: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
});
