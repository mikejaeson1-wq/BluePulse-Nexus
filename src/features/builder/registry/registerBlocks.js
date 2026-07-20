import { registerBlock } from "./blockRegistry";

import { definition as Hero } from "../../../components/blocks/Hero";
import { definition as Text } from "../../../components/blocks/Text";
import { definition as Image } from "../../../components/blocks/Image";
import { definition as Section } from "../../../components/blocks/Section";

const blocks = [

    Hero,

    Section,

    Text,

    Image

];

blocks.forEach(registerBlock);