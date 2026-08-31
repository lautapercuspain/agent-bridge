// Shared helpers for talking to the WebMCP context (native or polyfilled).

// executeTool() is a Chromium/native WebMCP extension not present in the
// standard document.modelContext type, so we narrow to the members we use.
export type ExecutableModelContext = {
	getTools: NonNullable<typeof document.modelContext>["getTools"];
	executeTool?: (
		tool: WebMCP.RegisteredTool,
		inputArguments: string,
	) => Promise<string | null>;
};

// Prefer document.modelContext (current spec location). Reading
// navigator.modelContext emits a deprecation warning in Chrome.
export function getModelContext(): ExecutableModelContext | undefined {
	if (typeof document === "undefined") return undefined;
	return document.modelContext as ExecutableModelContext | undefined;
}

// Native WebMCP returns RegisteredTool.inputSchema as a JSON string; the
// polyfill returns a parsed object. Model function `parameters` must be an
// object, so normalize either form to a plain JSON Schema object.
export function toSchemaObject(schema: unknown): Record<string, unknown> {
	if (typeof schema === "string") {
		try {
			const parsed = JSON.parse(schema);
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
				return parsed as Record<string, unknown>;
			}
		} catch {
			// fall through to an empty schema
		}
	} else if (schema && typeof schema === "object" && !Array.isArray(schema)) {
		return schema as Record<string, unknown>;
	}
	return { type: "object", properties: {} };
}
