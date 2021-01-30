import { commonLineHeight } from "../common/commonTextHeightSpacing";
import { lvglTextSize as lvglTextSizeBox } from "./builderImpl/lvglTextSize";
import { AltTextNode } from "../altNodes/altMixins";
import { LvglDefaultBuilder } from "./lvglDefaultBuilder";
import { commonLetterSpacing } from "../common/commonTextHeightSpacing";
import { formatWithJSX } from "../common/parseJSX";
import { convertFontWeight } from "../common/convertFontWeight";
import { objectName } from "./builderImpl/lvglObjectName";
export class LvglTextBuilder extends LvglDefaultBuilder {
  constructor(node: AltTextNode, showLayerName: boolean, optIsJSX: boolean) {
    super(node, showLayerName, optIsJSX);
  }

  // must be called before Position method
  textAutoFormat(node: AltTextNode): this {
    if (node.textAutoResize === "NONE") {
      // going to be used for position
      this.hasFixedSize = true;
    }
	var myStyle=""

    myStyle += lvglTextSizeBox(node, this.isJSX);

    if (node.fontSize !== figma.mixed) {
      myStyle += "\n    lv_style_set_text_font(&style_font_"+objectName(node.id)+", LV_STATE_DEFAULT, &lv_font_montserrat_"+node.fontSize+");"
    }

    if (node.fontName !== figma.mixed) {
      const lowercaseStyle = node.fontName.style.toLowerCase();

      if (lowercaseStyle.match("italic")) {
        myStyle += formatWithJSX("font-style", this.isJSX, "italic");
      }

      if (!lowercaseStyle.match("regular")) {


		  const value = node.fontName.style
			.replace("italic", "")
			.replace(" ", "")
			.toLowerCase();

		  const weight = convertFontWeight(value);

		  if (weight !== null && weight !== "400") {
			myStyle += formatWithJSX("font-weight", this.isJSX, weight);
		  }
	  }
    }
	
    const letterSpacing = commonLetterSpacing(node);
    if (letterSpacing > 0) {
      myStyle += formatWithJSX("letter-spacing", this.isJSX, letterSpacing);
    }

    const lineHeight = commonLineHeight(node);
    if (lineHeight > 0) {
      myStyle += formatWithJSX("line-height", this.isJSX, lineHeight);
    }


    // if alignHorizontal is LEFT, don't do anything because that is native

    // only undefined in testing
    if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
      // todo when node.textAutoResize === "WIDTH_AND_HEIGHT" and there is no \n in the text, this can be ignored.
      switch (node.textAlignHorizontal) {
        case "CENTER":
          myStyle += formatWithJSX("text-align", this.isJSX, "center");
          break;
        case "RIGHT":
          myStyle += formatWithJSX("text-align", this.isJSX, "right");
          break;
        case "JUSTIFIED":
          myStyle += formatWithJSX("text-align", this.isJSX, "justify");
          break;
      }
    }


    if (node.textCase === "LOWER") {
      myStyle += formatWithJSX("text-transform", this.isJSX, "lowercase");
    } else if (node.textCase === "TITLE") {
      myStyle += formatWithJSX("text-transform", this.isJSX, "capitalize");
    } else if (node.textCase === "UPPER") {
      myStyle += formatWithJSX("text-transform", this.isJSX, "uppercase");
    } else if (node.textCase === "ORIGINAL") {
      // default, ignore
    }


    if (node.textDecoration === "UNDERLINE") {
      myStyle += formatWithJSX("text-decoration", this.isJSX, "underline");
    } else if (node.textDecoration === "STRIKETHROUGH") {
      myStyle += formatWithJSX(        "text-decoration",        this.isJSX,        "line-through"      );
    }
	
	if(myStyle != ""){
		  this.style =  this.style +  "\n    static lv_style_t style_font_"+objectName(node.id)+";" + myStyle;
	}	

    return this;
  }
}
