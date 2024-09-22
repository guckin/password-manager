import esbuild from "esbuild";
import path from "path";
const __dirname = new URL(".", import.meta.url).pathname;

await esbuild.build({
    entryPoints: [path.join(__dirname, "index.tsx")],
    bundle: true,
    outfile: path.join(__dirname, "public", "bundle.js"),
    loader: { ".tsx": "tsx" }, // Use tsx loader for TypeScript + JSX
    minify: true,
    sourcemap: true,
});
