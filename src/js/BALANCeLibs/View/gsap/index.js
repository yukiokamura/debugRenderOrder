import gsap from "gsap";
//drawSVG
import { DrawSVGPlugin } from "./DrawSVG/DrawSVGPlugin.js";
gsap.registerPlugin(DrawSVGPlugin);

//customEase
import { CustomEase } from "./CustomEase/CustomEase.js";
gsap.registerPlugin(CustomEase);
