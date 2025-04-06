// @ts-nocheck
import { visit, SKIP } from "unist-util-visit";

export function rehypeUnwrapImages() {
  function containsImage(node) {
    return (
      node.tagName === "p" &&
      node.children.some((child) => {
        if (child.type === "element") {
          return child.tagName === "img";
        }
      })
    );
  }
  return (tree) => {
    visit(tree, containsImage, (node, index, parent) => {
      if (node.type === "element") {
        parent.children.splice(index, 1, ...node.children);
        return [SKIP, index];
      }
    });
  };
}

export function rehypeCopyCode() {
  function codeTitle(node) {
    if (node.tagName === "div") {
      return node.properties.className[0] === "rehype-code-title";
    }
  }
  return (tree) => {
    visit(tree, codeTitle, (node) => {
      if (node.type !== "element") return;
      const value = node.children[0].type === "text" ? node.children[0].value : "";
      node.children = [
        {
          type: "element",
          tagName: "span",
          children: [{ type: "text", value }]
        },
        {
          type: "element",
          tagName: "button",
          properties: { className: ["copy"] },
          children: [{ type: "text", value: `Copy` }]
        }
      ];
    });
  };
}

// Modified rehypeDiffHighlight that uses explicit markers
export function rehypeDiffHighlight() {
  return (tree) => {
    visit(tree, "element", (node) => {
      // Only process pre > code elements
      if (
        node.tagName !== "pre" ||
        !node.children.length ||
        node.children[0].tagName !== "code"
      ) {
        return;
      }

      const codeNode = node.children[0];

      // Find elements with code-line class
      const codeLines = codeNode.children.filter(
        (child) =>
          child.type === "element" &&
          child.properties &&
          child.properties.className &&
          child.properties.className.includes("code-line")
      );

      if (!codeLines.length) return;

      // Process each line looking for explicit markers
      for (const lineNode of codeLines) {
        // Get the text content of the line
        let lineText = "";
        visit(lineNode, "text", (textNode) => {
          lineText += textNode.value;
        });

        // Look for explicit diff markers at the end of lines
        const hasAddMarker = lineText.trim().endsWith("// [+]");
        const hasRemoveMarker = lineText.trim().endsWith("// [-]");

        if (hasAddMarker) {
          // Add the diff-add class
          lineNode.properties.className = [
            ...(lineNode.properties.className || []),
            "diff-add"
          ];

          // Remove the marker from all text nodes
          removeMarkerFromLine(lineNode, "// [+]");
        } else if (hasRemoveMarker) {
          // Add the diff-remove class
          lineNode.properties.className = [
            ...(lineNode.properties.className || []),
            "diff-remove"
          ];

          // Remove the marker from all text nodes
          removeMarkerFromLine(lineNode, "// [-]");
        }
      }
    });
  };
}

// Helper function to remove markers from text nodes
function removeMarkerFromLine(lineNode, marker) {
  visit(lineNode, "text", (textNode) => {
    if (textNode.value.includes(marker)) {
      textNode.value = textNode.value.replace(marker, "");
    }
  });
}
