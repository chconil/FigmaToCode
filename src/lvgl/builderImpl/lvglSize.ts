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
    w = ""+size.width;
  } else if (size.width === "full") {
    w ="100%";
  }

  let h = "";
  if (typeof size.height === "number") {
    h = ""+size.height;
  } else if (typeof size.height === "string") {
    h = "100%";
  }

  return [w, h];
};
