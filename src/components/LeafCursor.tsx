import React, { useEffect } from 'react';

export const LeafCursor: React.FC = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'sacred-canopy-cursor-map';
    style.textContent = `
      html, body, button, a, [role="button"] { cursor: url('/cursors/01_leaf_butterfly_default.png') 8 5, auto; }
      a:hover, button:hover, [role="button"]:hover { cursor: url('/cursors/10_leaf_hand_click.png') 8 5, pointer; }
      input, textarea, [contenteditable="true"] { cursor: url('/cursors/09_leaf_text_select.png') 8 5, text; }
      button:disabled, [aria-disabled="true"] { cursor: url('/cursors/07_leaf_forbidden.png') 8 5, not-allowed; }
      button[type="submit"], .cursor-pointer { cursor: url('/cursors/03_leaf_butterfly_sparkle.png') 8 5, pointer; }
      [draggable="true"] { cursor: url('/cursors/08_leaf_move.png') 8 5, move; }
      .cursor-help, [title], [aria-label*="ช่วย"] { cursor: url('/cursors/05_leaf_butterfly_help.png') 8 5, help; }
      .cursor-wait, [aria-busy="true"] { cursor: url('/cursors/15_leaf_loading.png') 8 5, wait; }
      .cursor-zoom-in { cursor: url('/cursors/04_leaf_butterfly_glow.png') 8 5, zoom-in; }
      .cursor-crosshair { cursor: url('/cursors/06_leaf_plus.png') 8 5, crosshair; }
      .resize-x, input[type="range"] { cursor: url('/cursors/12_leaf_horizontal_resize.png') 8 5, ew-resize; }
      .resize-y { cursor: url('/cursors/13_leaf_vertical_resize.png') 8 5, ns-resize; }
      .resize-diagonal { cursor: url('/cursors/11_leaf_diagonal_resize.png') 8 5, nwse-resize; }
      .resize-diagonal-alt { cursor: url('/cursors/14_leaf_diagonal_resize_alt.png') 8 5, nesw-resize; }
      .cursor-alt { cursor: url('/cursors/02_leaf_butterfly_alt.png') 8 5, auto; }
    `; document.head.appendChild(style); return () => style.remove();
  }, []);
  return null;
};
