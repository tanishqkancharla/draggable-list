#!/usr/bin/env node
import { build } from "estrella";

build({
	entry: ["./src/index.tsx", "./src/style.css"],
	outdir: "dist",
	sourceRoot: "src",
	watch: true,
	bundle: true,
	minify: false,

	tslint: "on",
	sourcemap: "inline",
	sourcesContent: true,
	run: "npx serve -n -l 3000 dist",
});
