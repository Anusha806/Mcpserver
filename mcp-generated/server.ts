
function sampleFromSchema(schema: any) {
  if (!schema || schema.type !== "object") return {};
  const out: any = {};
  const props = schema.properties || {};
  for (const key of Object.keys(props)) {
    const def = props[key] || {};
    switch (def.type) {
      case "number": out[key] = 42; break;
      case "integer": out[key] = 42; break;
      case "boolean": out[key] = true; break;
      case "string": out[key] = "example"; break;
      case "array": out[key] = []; break;
      case "object": out[key] = {}; break;
      default: out[key] = null;
    }
  }
  return out;
}

if (TEST_MODE) {
  console.log("🧪 Test mode: schema smoke test for \"Calculator Tool\" (v0.1.0)");
  console.log("\n--- Tool: Basic Arithmetic ---");
  console.log("Description: Calculates the sum, difference, product, and quotient of two numbers.");
  const sampleInput_0 = sampleFromSchema({
  "type": "object",
  "properties": {
    "number1": {
      "type": "number"
    },
    "number2": {
      "type": "number"
    }
  },
  "required": [
    "number1",
    "number2"
  ]
});
  console.log("Sample input:");
  print(sampleInput_0);
  console.log("Expected output schema:");
  print({
  "type": "object",
  "properties": {
    "sum": {
      "type": "number"
    },
    "difference": {
      "type": "number"
    },
    "product": {
      "type": "number"
    },
    "quotient": {
      "type": "number"
    }
  }
});
  process.exit(0);
}

// Normal MCP server mode (only runs when NOT in --test)
const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
const { stdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");

const server = new Server(
  { name: "Calculator Tool", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.tool(
  "Basic Arithmetic",
  "Calculates the sum, difference, product, and quotient of two numbers.",
  z.object({
    number1: z.number(),
    number2: z.number()
  }),
  async (_args) => {
    // Generic placeholder that returns the correct output shape.
    // Real logic will be provided by the client or later codegen stages.
    return {
      sum: null,
      difference: null,
      product: null,
      quotient: null
    };
  }
);

const transport = stdioServerTransport();
await server.connect(transport); --}}


import { z } from "zod";

const TEST_MODE = process.argv.includes("--test");



function print(obj: unknown) {
  try {
    function normalize(o: any): any {
      if (Array.isArray(o)) return o.map(normalize);
      if (o && typeof o === "object") return Object.fromEntries(Object.entries(o).map(([k,v]) => [k, normalize(v)]));
      return o;
    }
    console.log(JSON.stringify(normalize(obj), null, 2));
  } catch {
    console.log(obj);
  }
}



function sampleFromSchema(schema: any) {
  if (!schema || schema.type !== "object") return {};
  const out: any = {};
  for (const key of Object.keys(schema.properties || {})) {
    const def = schema.properties[key];
    switch (def.type) {
      case "number": out[key] = 42; break;
      case "integer": out[key] = 42; break;
      case "boolean": out[key] = true; break;
      case "string": out[key] = "example"; break;
      case "array": out[key] = []; break;
      case "object": out[key] = sampleFromSchema(def); break;
      default: out[key] = null;
    }
  }
  return out;
}

if (TEST_MODE) {
  console.log("🧪 Test mode: schema smoke test for \"Calculator Tool\"");
  console.log("\n--- Tool: Basic Arithmetic ---");
  console.log("Description:", "Calculates the sum, difference, product, and quotient of two numbers.");
  const sampleInput_0 = sampleFromSchema({
  "type": "object",
  "properties": {
    "number1": {
      "type": "number"
    },
    "number2": {
      "type": "number"
    }
  },
  "required": [
    "number1",
    "number2"
  ]
});
  console.log("Sample input:");
  print(sampleInput_0);
  console.log("Expected output:");
  print({
  "type": "object",
  "properties": {
    "sum": {
      "type": "number"
    },
    "difference": {
      "type": "number"
    },
    "product": {
      "type": "number"
    },
    "quotient": {
      "type": "number"
    }
  }
});
  process.exit(0);
}

// Normal MCP server mode
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({ name: "Calculator Tool", version: "0.1.0" }, { capabilities: { tools: {} } });

server.registerTool(
  "Basic Arithmetic",
  {
    description: "Calculates the sum, difference, product, and quotient of two numbers.",
    input: z.object({
    number1: z.number(),
    number2: z.number()
  }),
    output: z.object({
    sum: z.number().optional(),
    difference: z.number().optional(),
    product: z.number().optional(),
    quotient: z.number().optional()
  }),
    handler: async (_args: any) => ({
      sum: null,
      difference: null,
      product: null,
      quotient: null
    }),
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
