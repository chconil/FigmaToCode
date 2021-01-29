import { formatWithJSX } from "./../../common/parseJSX";
import { AltSceneNode } from "../../altNodes/altMixins";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";

export const lvglSize = (node: AltSceneNode, isJSX: boolean): string => {
  return lvglSizePartial(node, isJSX).join("");
};

export const lvglSizePartial = (
  node: AltSceneNode,
  isJsx: boolean
): [string, string] => {
  const size = nodeWidthHeight(node, false);

  let w = "";
  if (typeof size.width === "number") {
    w += formatWithJSX("width", isJsx, size.width);
  } else if (size.width === "full") {
    w += formatWithJSX("width", isJsx, "100%");
  }

  let h = "";
  if (typeof size.height === "number") {
    h += formatWithJSX("height", isJsx, size.height);
  } else if (typeof size.height === "string") {
    h += formatWithJSX("height", isJsx, "100%");
  }

  return [w, h];
};
