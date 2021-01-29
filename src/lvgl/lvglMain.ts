import {
  AltFrameNode,
  AltSceneNode,
  AltRectangleNode,
  AltEllipseNode,
  AltTextNode,
  AltGroupNode,
} from "../altNodes/altMixins";
import { LvglTextBuilder } from "./lvglTextBuilder";
import { LvglDefaultBuilder as LvglDefaultBuilder } from "./lvglDefaultBuilder";
import { formatWithJSX } from "../common/parseJSX";

let parentId = "";

let showLayerName = false;

export const lvglMain = (
  sceneNode: Array<AltSceneNode>,
  parentIdSrc: string = "",
  isJsx: boolean = false,
  layerName: boolean = false
): string => {
  parentId = parentIdSrc;
  showLayerName = layerName;

  let result = lvglWidgetGenerator(sceneNode, isJsx);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.slice(0, 1) === "\n") {
    result = result.slice(1, result.length);
  }

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const lvglWidgetGenerator = (
  sceneNode: ReadonlyArray<AltSceneNode>,
  isJsx: boolean
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible !== false);

  const sceneLen = visibleSceneNode.length;

  visibleSceneNode.forEach((node, index) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += lvglContainer(node, "", "", isJsx);
    } else if (node.type === "GROUP") {
      comp += lvglGroup(node, isJsx);
    } else if (node.type === "FRAME") {
      comp += lvglFrame(node, isJsx);
    } else if (node.type === "TEXT") {
      comp += lvglText(node, false, isJsx);
    }

    comp += addSpacingIfNeeded(node, index, sceneLen, isJsx);

    // todo support Line
  });

  return comp;
};

const lvglGroup = (node: AltGroupNode, isJsx: boolean = false): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width <= 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  // const vectorIfExists = tailwindVector(node, isJsx);
  // if (vectorIfExists) return vectorIfExists;

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new LvglDefaultBuilder(node, showLayerName, isJsx)
    .blend(node, parentId)
    .widthHeight(node, parentId)
    .position(node, parentId);

  if (builder.style) {
    const attr = builder.build(formatWithJSX("position", isJsx, "relative"));
    return `\n<div${attr}>${lvglWidgetGenerator(node.children, isJsx)}</div>`;
  }

  return lvglWidgetGenerator(node.children, isJsx);
};

const lvglText = (
  node: AltTextNode,
  isInput: boolean = false,
  isJsx: boolean
): string | [string, string] => {
  // follow the website order, to make it easier

  const builderResult = new LvglTextBuilder(node, showLayerName, isJsx)
    .blend(node, parentId)
    .textAutoSize(node)
    .position(node, parentId)
    // todo fontFamily (via node.fontName !== figma.mixed ? `fontFamily: ${node.fontName.family}`)
    // todo font smoothing
    .fontSize(node)
    .fontStyle(node)
    .letterSpacing(node)
    .lineHeight(node)
    .textDecoration(node)
    // todo text lists (<li>)
    .textAlign(node)
    .customColor(node.fills, "text", parentId)
    .textTransform(node);

  const splittedChars = node.characters.split("\n");
  const charsWithLineBreak =
    splittedChars.length > 1
      ? node.characters.split("\n").join("<br/>")
      : node.characters;

  if (isInput) {
    return [builderResult.style, charsWithLineBreak];
  } else {
    return `\n<p${builderResult.build()}>${charsWithLineBreak}</p>`;
  }
};

const lvglFrame = (node: AltFrameNode, isJsx: boolean = false): string => {
  // const vectorIfExists = tailwindVector(node, isJsx);
  // if (vectorIfExists) return vectorIfExists;

  if (
    node.children.length === 1 &&
    node.children[0].type === "TEXT" &&
    node?.name?.toLowerCase().match("input")
  ) {
    const isInput = true;
    const [attr, char] = lvglText(node.children[0], isInput, isJsx);
    return lvglContainer(node, ` placeholder="${char}"`, attr, isJsx, isInput);
  }

  const childrenStr = lvglWidgetGenerator(node.children, isJsx);

  if (node.layoutMode !== "NONE") {
    const rowColumn = rowColumnProps(node, isJsx);
    return lvglContainer(node, childrenStr, rowColumn, isJsx);
  } else {
    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return lvglContainer(
      node,
      childrenStr,
      formatWithJSX("position", isJsx, "relative"),
      isJsx
    );
  }
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const lvglContainer = (
  node: AltFrameNode | AltRectangleNode | AltEllipseNode,
  children: string,
  additionalStyle: string = "",
  isJsx: boolean,
  isInput: boolean = false
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return children;
  }

  const builder = new LvglDefaultBuilder(node, showLayerName, isJsx)
    .blend(node, parentId)
    .autoLayoutPadding(node)
    .widthHeight(node, parentId)
    .position(node, parentId)
    .customColor(node.fills, "background-color", parentId)
    // TODO image and gradient support (tailwind does not support gradients)
    .shadow(node)
    .border(node);

  if (isInput) {
    return `\n<input${builder.build(additionalStyle)}>${children}</input>`;
  }

  if (builder.style || additionalStyle) {
    return `\n<div${builder.build(additionalStyle)}>${children}</div>`;
  }

  return children;
};

export const rowColumnProps = (node: AltFrameNode, isJsx: boolean): string => {
  // ROW or COLUMN

  // ignore current node when it has only one child and it has the same size
  if (
    node.children.length === 1 &&
    node.children[0].width === node.width &&
    node.children[0].height === node.height
  ) {
    return "";
  }

  // [optimization]
  // flex, by default, has flex-row. Therefore, it can be omitted.
  const rowOrColumn =
    node.layoutMode === "HORIZONTAL"
      ? formatWithJSX("flex-direction", isJsx, "row")
      : formatWithJSX("flex-direction", isJsx, "column");

  // special case when there is only one children; need to position correctly in Flex.
  // let justify = "justify-center";
  // if (node.children.length === 1) {
  //   const nodeCenteredPosX = node.children[0].x + node.children[0].width / 2;
  //   const parentCenteredPosX = node.width / 2;

  //   const marginX = nodeCenteredPosX - parentCenteredPosX;

  //   // allow a small threshold
  //   if (marginX < -4) {
  //     justify = "justify-start";
  //   } else if (marginX > 4) {
  //     justify = "justify-end";
  //   }
  // }
  let primaryAlign: string;

  switch (node.primaryAxisAlignItems) {
    case "MIN":
      primaryAlign = "flex-start";
      break;
    case "CENTER":
      primaryAlign = "center";
      break;
    case "MAX":
      primaryAlign = "flex-end";
      break;
    case "SPACE_BETWEEN":
      primaryAlign = "justify-between";
      break;
  }
  primaryAlign = formatWithJSX("justify-content", isJsx, primaryAlign);

  // [optimization]
  // when all children are STRETCH and layout is Vertical, align won't matter. Otherwise, center it.
  let counterAlign: string;
  switch (node.counterAxisAlignItems) {
    case "MIN":
      counterAlign = "flex-start";
      break;
    case "CENTER":
      counterAlign = "center";
      break;
    case "MAX":
      counterAlign = "flex-end";
      break;
  }
  counterAlign = formatWithJSX("align-items", isJsx, counterAlign);

  // if parent is a Frame with AutoLayout set to Vertical, the current node should expand
  let flex =
    node.parent &&
    "layoutMode" in node.parent &&
    node.parent.layoutMode === node.layoutMode
      ? "flex"
      : "inline-flex";

  flex = formatWithJSX("display", isJsx, flex);

  return `${flex}${rowOrColumn}${counterAlign}${primaryAlign}`;
};

const addSpacingIfNeeded = (
  node: AltSceneNode,
  index: number,
  len: number,
  isJsx: boolean
): string => {
  if (node.parent?.type === "FRAME" && node.parent.layoutMode !== "NONE") {
    // check if itemSpacing is set and if it isn't the last value.
    // Don't add at the last value. In Figma, itemSpacing CAN be negative; here it can't.
    if (node.parent.itemSpacing > 0 && index < len - 1) {
      const wh = node.parent.layoutMode === "HORIZONTAL" ? "width" : "height";

      // don't show the layer name in these separators.
      const style = new LvglDefaultBuilder(node, false, isJsx).build(
        formatWithJSX(wh, isJsx, node.parent.itemSpacing)
      );
      return `\n<div${style}></div>`;
    }
  }
  return "";
};
