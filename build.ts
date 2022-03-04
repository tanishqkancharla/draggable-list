#!/usr/bin/env node
import { build } from "estrella";

build({
  entry: ["./src/index.ts", "./src/style.css"],
  outdir: "dist",
  bundle: true,
  minify: true,
});
