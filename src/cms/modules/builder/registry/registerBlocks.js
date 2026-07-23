import {
    registerBlock
} from "./blockRegistry";

import {
    definition as Hero
} from "@cms/modules/builder/blocks/Hero";

import {
    definition as Columns
} from "@cms/modules/builder/blocks/Columns";

import {
    definition as Section
} from "@cms/modules/builder/blocks/Section";

import {
    definition as Divider
} from "@cms/modules/builder/blocks/Divider";

import {
    definition as Spacer
} from "@cms/modules/builder/blocks/Spacer";

import {
    definition as Text
} from "@cms/modules/builder/blocks/Text";

import {
    definition as Quote
} from "@cms/modules/builder/blocks/Quote";

import {
    definition as CardGrid
} from "@cms/modules/builder/blocks/CardGrid";

import {
    definition as Image
} from "@cms/modules/builder/blocks/Image";

import {
    definition as CallToAction
} from "@cms/modules/builder/blocks/CallToAction";

import {
    definition as Stats
} from "@cms/modules/builder/blocks/Stats";

const blocks = [
    Hero,
    Columns,
    Section,
    Divider,
    Spacer,
    Text,
    Quote,
    CardGrid,
    Image,
    CallToAction,
    Stats
];

blocks.forEach(
    registerBlock
);