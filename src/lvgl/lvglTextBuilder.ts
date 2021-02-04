import { commonLineHeight } from "../common/commonTextHeightSpacing";
import { nodeWidthHeight } from "../common/nodeWidthHeight";
import { AltTextNode } from "../altNodes/altMixins";
import { LvglDefaultBuilder } from "./lvglDefaultBuilder";
import { commonLetterSpacing } from "../common/commonTextHeightSpacing";
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
	
    const sizeResult = nodeWidthHeight(node, false);
    if (sizeResult.width && node.textAutoResize !== "WIDTH_AND_HEIGHT") {
      if (typeof sizeResult.width === "number") {
		this.style  += "\n    lv_obj_set_width("+objectName(node.id)+","+ sizeResult.width+ ");";

      }
    }

    if (sizeResult.height && node.textAutoResize === "NONE") {
      if (typeof sizeResult.height === "number") {
		this.style  += "\n    lv_obj_set_height("+objectName(node.id)+","+ sizeResult.height+ ");";
      }
    }
      var font_extra = "";
    if (node.fontName !== figma.mixed)  {
      const lowercaseStyle = node.fontName.style.toLowerCase();

      if (lowercaseStyle.match("italic")) {
        font_extra = "_italic";
      }

      if (!lowercaseStyle.match("regular")) {
		  const value = node.fontName.style
			.replace("italic", "")
			.replace(" ", "")
			.toLowerCase();

		  const weight = convertFontWeight(value);
		  if (weight !== null && weight !== "400") {
	         font_extra +="_weight"+weight;
		  }
	  }
	}
	if (node.fontSize !== figma.mixed){
	  myStyle += "\n    lv_style_set_text_font(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, &lv_font_montserrat_"+node.fontSize+font_extra+");"
    } else {
      myStyle += "\n    lv_style_set_text_font(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, &lv_font_montserrat_STANDARD"+font_extra+");"
	}

    const letterSpacing = commonLetterSpacing(node);
    if (letterSpacing > 0) {
	  myStyle += "\n    lv_style_set_value_letter_space(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+letterSpacing+");";
    }

    const lineHeight = commonLineHeight(node);
    if (lineHeight > 0) {
	  myStyle += "\n    lv_style_set_value_line_space(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, "+lineHeight+"); //Warning: probably wrong ";

    }


    // if alignHorizontal is LEFT, don't do anything because that is native

    // only undefined in testing
    if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
      // todo when node.textAutoResize === "WIDTH_AND_HEIGHT" and there is no \n in the text, this can be ignored.
      switch (node.textAlignHorizontal) {
        case "CENTER":
	      myStyle += "\n    lv_style_set_value_align(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, LV_ALIGN_CENTER);";
          break;
        case "RIGHT":
	      myStyle += "\n    lv_style_set_value_align(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, LV_ALIGN_RIGHT);";
          break;
        case "JUSTIFIED":
	      myStyle += "\n    lv_style_set_value_align(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, LV_ALIGN_JUSTIFIED);";
          break;
      }
    }


    if (node.textDecoration === "UNDERLINE") {
		myStyle += "\n    lv_style_set_text_decor(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, LV_TEXT_DECOR_UNDERLINE);"
    } else if (node.textDecoration === "STRIKETHROUGH") {
		myStyle += "\n    lv_style_set_text_decor(&style_"+objectName(node.id)+", LV_STATE_DEFAULT, LV_TEXT_DECOR_STRIKETHROUGH);"
    }
	
	if(myStyle != ""){
		  this.style =  this.style +  "\n    static lv_style_t style_"+objectName(node.id)+";" + myStyle;
	}	

    return this;
  }
}
