import { visit } from 'unist-util-visit';

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Text} Text
 */

/**
 * A remark plugin to add spacing between CJK and Latin characters.
 * This implementation is server/edge-safe and avoids DOM-dependent imports.
 */
export default function remarkPanguSpacing() {
  const CJK =
    '\\u2E80-\\u2EFF\\u2F00-\\u2FDF\\u3040-\\u30FF\\u3100-\\u312F\\u3200-\\u32FF\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF';
  const WORD = 'A-Za-z0-9';

  const cjkToWord = new RegExp(`([${CJK}])([${WORD}@#&\\$%\\^\\*\\-\\+\\\\=\\|/])`, 'g');
  const wordToCjk = new RegExp(`([${WORD}~!;:,\\.\\?])([${CJK}])`, 'g');
  const cjkToOpen = new RegExp(`([${CJK}])([\\(\\[\\{<])`, 'g');
  const closeToCjk = new RegExp(`([\\)\\]\\}>])([${CJK}])`, 'g');

  /**
   * @param {string} input
   */
  function spacing(input) {
    return input
      .replace(cjkToWord, '$1 $2')
      .replace(wordToCjk, '$1 $2')
      .replace(cjkToOpen, '$1 $2')
      .replace(closeToCjk, '$1 $2');
  }

  /**
   * @param {Root} tree
   */
  return (tree) => {
    visit(tree, 'text', (node) => {
      if (node.type === 'text') {
        node.value = spacing(node.value);
      }
    });
  };
}
