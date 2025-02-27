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

export function rehypeDiffHighlight() {
  return (tree) => {
    // Find code blocks
    visit(tree, (node) => {
      if (
        node.tagName === "pre" &&
        node.children.length === 1 &&
        node.children[0].tagName === "code"
      ) {
        const codeNode = node.children[0];

        // Get the language to check if it's a diff or explicitly marked
        let isDiffCodeBlock = false;
        if (codeNode.properties && codeNode.properties.className) {
          const classNames = codeNode.properties.className;
          isDiffCodeBlock = classNames.some(
            (className) =>
              typeof className === "string" &&
              (className === "language-diff" || className.includes("diff"))
          );
        }

        // If not a diff block, we'll be more strict about marking lines
        const strictDiffMode = !isDiffCodeBlock;

        // Process line by line if we have line elements
        if (
          codeNode.children &&
          codeNode.children.some(
            (child) =>
              child.type === "element" &&
              child.properties?.className?.includes("code-line")
          )
        ) {
          // Process each line
          codeNode.children.forEach((lineNode) => {
            if (
              lineNode.type === "element" &&
              lineNode.properties?.className?.includes("code-line")
            ) {
              // Collect all text from the line
              let fullLineText = "";
              visit(lineNode, "text", (textNode) => {
                fullLineText += textNode.value;
              });

              // Trim whitespace but keep original structure
              const trimmedLine = fullLineText.trimStart();

              // Check if this is a diff line (starts with + or - and IS the first non-whitespace character)
              const isDiffLine =
                (trimmedLine.startsWith("+") || trimmedLine.startsWith("-")) &&
                // In strict mode, ensure it's ONLY a standalone + or - at the start
                (!strictDiffMode || /^[+-][^+-]/.test(trimmedLine));

              if (isDiffLine) {
                // First, add the appropriate diff class
                const diffMarker = trimmedLine.charAt(0);
                if (diffMarker === "+") {
                  lineNode.properties.className = [
                    ...(lineNode.properties.className || []),
                    "diff-add"
                  ];
                } else {
                  lineNode.properties.className = [
                    ...(lineNode.properties.className || []),
                    "diff-remove"
                  ];
                }

                // Find and process the first text node to remove the marker
                let processedFirstNode = false;
                visit(lineNode, "text", (textNode) => {
                  if (processedFirstNode) return SKIP;
                  if (textNode.value.trim()) {
                    const index = textNode.value.indexOf(diffMarker);
                    if (index !== -1) {
                      // Insert marker element before removing it from text
                      lineNode.children.unshift({
                        type: "element",
                        tagName: "span",
                        properties: {
                          className: [
                            "diff-marker",
                            diffMarker === "+" ? "diff-add-marker" : "diff-remove-marker"
                          ]
                        },
                        children: [{ type: "text", value: diffMarker }]
                      });

                      // Remove the marker from the text
                      textNode.value =
                        textNode.value.slice(0, index) + textNode.value.slice(index + 1);

                      processedFirstNode = true;
                      return SKIP;
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  };
}
