import { mountContentScript } from "cc-extension-core";
import "./style.css";
import { keybrSiteConfig } from "./site-config";

mountContentScript(keybrSiteConfig);
