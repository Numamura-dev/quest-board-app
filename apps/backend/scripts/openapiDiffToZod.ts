import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  type OpenApiDocumentLike,
  getChangedSchemas,
  renderChangedSchemas,
} from "../src/openapi/openapiDiffToZod";

type CliOptions = {
  base: string;
  head: string;
  out?: string;
};

const printUsage = () => {
  console.error(
    "Usage: pnpm openapi:diff-to-zod -- --base <base-openapi.json> --head <head-openapi.json> [--out <output.ts>]"
  );
};

const parseArgs = (argv: string[]): CliOptions | null => {
  const options: Partial<CliOptions> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--base" && next) {
      options.base = next;
      index += 1;
    } else if (arg === "--head" && next) {
      options.head = next;
      index += 1;
    } else if (arg === "--out" && next) {
      options.out = next;
      index += 1;
    } else {
      return null;
    }
  }

  if (!options.base || !options.head) {
    return null;
  }

  return options as CliOptions;
};

const loadDocument = async (filePath: string): Promise<OpenApiDocumentLike> => {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as OpenApiDocumentLike;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (!options) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const baseDocument = await loadDocument(options.base);
  const headDocument = await loadDocument(options.head);
  const changedSchemas = getChangedSchemas(baseDocument, headDocument);
  const rendered = renderChangedSchemas(changedSchemas);

  if (!rendered) {
    console.log("// no changed schemas");
    return;
  }

  const fileContent = `import { z } from "../src/openapi/zod";\n\n${rendered}\n`;

  if (options.out) {
    const outputPath = path.resolve(options.out);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, fileContent, "utf8");
    console.log(`written: ${outputPath}`);
    return;
  }

  console.log(fileContent);
};

void main();
