import { registerBlock } from "./blockRegistry";

import { definition as Hero } from "@cms/modules/builder/blocks/Hero";
import { definition as Text } from "@cms/modules/builder/blocks/Text";
import { definition as Image } from "@cms/modules/builder/blocks/Image";
import { definition as Section } from "@cms/modules/builder/blocks/Section";
const blocks = [

    Hero,

    Section,

    Text,

    Image

];

blocks.forEach(registerBlock);