type OpenApiRecord = Record<string, unknown>;

export type OpenApiDocumentLike = {
  components?: {
    schemas?: OpenApiRecord;
  };
};

export type ChangedSchema = {
  change: "added" | "modified";
  name: string;
  schema: unknown;
};

type OpenApiSchema = {
  $ref?: string;
  type?: string;
  format?: string;
  enum?: unknown[];
  nullable?: boolean;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  items?: OpenApiSchema;
  additionalProperties?: boolean | OpenApiSchema;
  anyOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  allOf?: OpenApiSchema[];
};

const sortValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as OpenApiRecord)
      .sort()
      .reduce<OpenApiRecord>((acc, key) => {
        acc[key] = sortValue((value as OpenApiRecord)[key]);
        return acc;
      }, {});
  }

  return value;
};

const stableStringify = (value: unknown) => JSON.stringify(sortValue(value));

const indent = (value: string, level: number) => {
  const prefix = "  ".repeat(level);
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
};

const toIdentifier = (name: string) => {
  const normalized = name
    .replace(/[^a-zA-Z0-9_$]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^[^a-zA-Z_$]+/, "");

  return normalized ? `${normalized}Schema` : "GeneratedSchema";
};

const refName = (ref: string) => ref.split("/").at(-1) ?? "UnknownRef";

const renderEnum = (schema: OpenApiSchema) => {
  const enumValues = (schema.enum ?? []).filter(
    (value): value is string => typeof value === "string"
  );

  if (enumValues.length > 0) {
    const renderedValues = enumValues.map((value) => JSON.stringify(value)).join(", ");
    return `z.enum([${renderedValues}])`;
  }

  const literalValues = (schema.enum ?? []).map((value) => `z.literal(${JSON.stringify(value)})`);
  return `z.union([${literalValues.join(", ")}])`;
};

const renderComposite = (
  kind: "anyOf" | "oneOf" | "allOf",
  schemas: OpenApiSchema[],
  level: number
) => {
  const rendered = schemas.map((entry) => renderSchema(entry, level + 1));

  if (kind === "allOf") {
    return rendered.reduce((acc, entry) => `${acc}.and(${entry})`);
  }

  return `z.union([\n${indent(rendered.join(",\n"), level + 1)}\n${"  ".repeat(level)}])`;
};

export const renderSchema = (rawSchema: unknown, level = 0): string => {
  const schema = (rawSchema ?? {}) as OpenApiSchema;
  let base: string;

  if (schema.$ref) {
    base = `${toIdentifier(refName(schema.$ref))}`;
  } else if (schema.enum) {
    base = renderEnum(schema);
  } else if (schema.anyOf?.length) {
    base = renderComposite("anyOf", schema.anyOf, level);
  } else if (schema.oneOf?.length) {
    base = renderComposite("oneOf", schema.oneOf, level);
  } else if (schema.allOf?.length) {
    base = renderComposite("allOf", schema.allOf, level);
  } else if (schema.type === "object" || schema.properties || schema.additionalProperties) {
    if (schema.properties) {
      const required = new Set(schema.required ?? []);
      const entries = Object.entries(schema.properties).map(([key, value]) => {
        const rendered = renderSchema(value, level + 1);
        const withOptional = required.has(key) ? rendered : `${rendered}.optional()`;
        return `${JSON.stringify(key)}: ${withOptional}`;
      });

      base = `z.object({\n${indent(entries.join(",\n"), level + 1)}\n${"  ".repeat(level)}})`;
    } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      base = `z.record(${renderSchema(schema.additionalProperties, level + 1)})`;
    } else {
      base = "z.record(z.unknown())";
    }
  } else if (schema.type === "array") {
    base = `z.array(${renderSchema(schema.items ?? {}, level + 1)})`;
  } else if (schema.type === "integer") {
    base = "z.number().int()";
  } else if (schema.type === "number") {
    base = "z.number()";
  } else if (schema.type === "boolean") {
    base = "z.boolean()";
  } else if (schema.type === "string") {
    if (schema.format === "date-time") {
      base = 'z.string().datetime({ offset: true }).or(z.string().datetime())';
    } else if (schema.format === "date") {
      base = "z.string()";
    } else {
      base = "z.string()";
    }
  } else {
    base = "z.unknown()";
  }

  return schema.nullable ? `${base}.nullable()` : base;
};

export const getChangedSchemas = (
  baseDocument: OpenApiDocumentLike,
  nextDocument: OpenApiDocumentLike
): ChangedSchema[] => {
  const baseSchemas = baseDocument.components?.schemas ?? {};
  const nextSchemas = nextDocument.components?.schemas ?? {};
  const changes: ChangedSchema[] = [];

  Object.entries(nextSchemas).forEach(([name, schema]) => {
    const current = stableStringify(schema);
    const previous = stableStringify(baseSchemas[name]);

    if (!(name in baseSchemas)) {
      changes.push({ name, schema, change: "added" });
      return;
    }

    if (current !== previous) {
      changes.push({ name, schema, change: "modified" });
    }
  });

  return changes;
};

export const renderChangedSchemas = (schemas: ChangedSchema[]) =>
  schemas
    .map(({ change, name, schema }) => {
      const schemaName = toIdentifier(name);
      return `// ${change}: ${name}\nexport const ${schemaName} = ${renderSchema(schema)};`;
    })
    .join("\n\n");
