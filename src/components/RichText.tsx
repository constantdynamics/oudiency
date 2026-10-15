import { Fragment, type ReactNode, useMemo } from 'react';
import { cx } from '@/lib/cx';
import { closeOpenMarkers, type Block, type Inline, parseMarkdown } from '@/lib/markdown';

/**
 * Veilige weergave van (AI-)tekst: beperkte markdown via een eigen parser, gerenderd als gewone
 * React-elementen. Nooit dangerouslySetInnerHTML.
 */
export function RichText({
  text,
  streaming = false,
  className,
}: {
  text: string;
  streaming?: boolean;
  className?: string;
}) {
  const blocks = useMemo(
    () => parseMarkdown(streaming ? closeOpenMarkers(text) : text),
    [text, streaming],
  );
  return <div className={cx('rich-text', className)}>{blocks.map(renderBlock)}</div>;
}

function renderBlock(block: Block, index: number): ReactNode {
  switch (block.type) {
    case 'paragraph':
      return <p key={index}>{renderInline(block.children)}</p>;
    case 'heading':
      return <h4 key={index}>{renderInline(block.children)}</h4>;
    case 'quote':
      return <blockquote key={index}>{renderInline(block.children)}</blockquote>;
    case 'list': {
      const items = block.items.map((item, i) => <li key={i}>{renderInline(item)}</li>);
      return block.ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>;
    }
  }
}

function renderInline(nodes: Inline[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return <Fragment key={index}>{node.text}</Fragment>;
      case 'break':
        return <br key={index} />;
      case 'strong':
        return <strong key={index}>{renderInline(node.children)}</strong>;
      case 'em':
        return <em key={index}>{renderInline(node.children)}</em>;
    }
  });
}
