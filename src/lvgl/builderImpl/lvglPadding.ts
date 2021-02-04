import { numToAutoFixed } from "../../common/numToAutoFixed";
import { AltFrameMixin, AltDefaultShapeMixin,AltSceneNode,AltFrameNode,AltRectangleNode,AltEllipseNode } from "../../altNodes/altMixins";
import { commonPadding } from "../../common/commonPadding";
import { objectName } from "./lvglObjectName";
/**
 * https://tailwindcss.com/docs/margin/
 * example: px-2 py-8
 */
export const lvglPadding = (
  node: AltFrameNode | AltRectangleNode | AltEllipseNode,
  isJsx: boolean
): string => {
  const padding = commonPadding(node);
  if (!padding) {
    return "";
  }


  let paddingString="";

  if ("all" in padding) {
	paddingString+="\n    //Full pading of "+padding.all;
	paddingString+="\n    lv_style_set_pad_top(&style_"+objectName(node.id)+","+ padding.all+");";
	paddingString+="\n    lv_style_set_pad_bottom(&style_"+objectName(node.id)+","+ padding.all+");";
	paddingString+="\n    lv_style_set_pad_left(&style_"+objectName(node.id)+","+ padding.all+");";
	paddingString+="\n    lv_style_set_pad_right(&style_"+objectName(node.id)+","+ padding.all+");";
    return paddingString;
  }


  // horizontal and vertical, as the default AutoLayout
  if (padding.horizontal) {
	paddingString+="\n    lv_style_set_pad_left(&style_"+objectName(node.id)+","+ padding.horizontal+");";
	paddingString+="\n    lv_style_set_pad_right(&style_"+objectName(node.id)+","+ padding.horizontal+");";
  }
  if (padding.vertical) {
	paddingString+="\n    lv_style_set_pad_top(&style_"+objectName(node.id)+","+ padding.vertical+");";
	paddingString+="\n    lv_style_set_pad_bottom(&style_"+objectName(node.id)+","+ padding.vertical+");";
  }
  if (padding.top) {
	paddingString+="\n    lv_style_set_pad_top(&style_"+objectName(node.id)+","+ padding.top+");";
  }
  if (padding.bottom) {
	paddingString+="\n    lv_style_set_pad_bottom(&style_"+objectName(node.id)+","+ padding.bottom+");";
  }
  if (padding.left) {
	paddingString+="\n    lv_style_set_pad_left(&style_"+objectName(node.id)+","+ padding.left+");";
  }
  if (padding.right) {
	paddingString+="\n    lv_style_set_pad_right(&style_"+objectName(node.id)+","+ padding.right+");";
  }
  if(paddingString != ""){
	paddingString+="\n";
  }
  return paddingString;
};
