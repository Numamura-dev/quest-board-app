import {
  getChangedSchemas,
  renderChangedSchemas,
  renderSchema,
} from "../../openapi/openapiDiffToZod";

describe("openapiDiffToZod", () => {
  it("追加・変更された schema だけを検出する", () => {
    const changed = getChangedSchemas(
      {
        components: {
          schemas: {
            User: {
              type: "object",
              properties: {
                id: { type: "integer" },
              },
              required: ["id"],
            },
          },
        },
      },
      {
        components: {
          schemas: {
            User: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
              },
              required: ["id", "name"],
            },
            Quest: {
              type: "object",
              properties: {
                title: { type: "string" },
              },
              required: ["title"],
            },
          },
        },
      }
    );

    expect(changed).toHaveLength(2);
    expect(changed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Quest", change: "added" }),
        expect.objectContaining({ name: "User", change: "modified" }),
      ])
    );
  });

  it("object schema を zod object 文字列へ変換する", () => {
    const rendered = renderSchema({
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["id", "name"],
    });

    expect(rendered).toContain('"id": z.number().int()');
    expect(rendered).toContain('"name": z.string()');
    expect(rendered).toContain('"tags": z.array(z.string()).optional()');
  });

  it("変更 schema 群を export 文へ整形する", () => {
    const rendered = renderChangedSchemas([
      {
        name: "QuestActionResponse",
        change: "added",
        schema: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          required: ["message"],
        },
      },
    ]);

    expect(rendered).toContain("// added: QuestActionResponse");
    expect(rendered).toContain("export const QuestActionResponseSchema = z.object");
  });
});
