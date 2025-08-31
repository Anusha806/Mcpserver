const TEST_MODE = process.argv.includes("--test");

function print(obj: unknown) {
  try {
    console.log(JSON.stringify(obj, null, 2));
  } catch {
    console.log(String(obj));
  }
}

function sampleFromSchema(schema: any) {
  if (!schema || schema.type !== "object") return {};
  
  const out: any = {};
  const props = schema.properties || {};
  
  for (const key of Object.keys(props)) {
    const def = props[key] || {};
    switch (def.type) {
      case "number":
      case "integer":
        out[key] = 42;
        break;
      case "boolean":
        out[key] = true;
        break;
      case "string":
        out[key] = "example";
        break;
      case "array":
        out[key] = [];
        break;
      case "object":
        out[key] = {};
        break;
      default:
        out[key] = null;
    }
  }
  return out;
}

if (TEST_MODE) {
  console.log("🧪 Test mode for BMI Calculator v0.1.0");
  
  console.log("\n--- Tool: Calculate BMI ---");
  console.log("Description: Calculates BMI based on weight and height and categorizes it.");
  
  const sampleInput = sampleFromSchema({
  "type": "object",
  "properties": {
    "weight": {
      "type": "number",
      "description": "Weight in kilograms"
    },
    "height": {
      "type": "number",
      "description": "Height in centimeters"
    }
  },
  "required": [
    "weight",
    "height"
  ]
});
  console.log("Sample input:");
  print(sampleInput);
  
  console.log("Expected output schema:");
  print({
  "type": "object",
  "properties": {
    "bmi": {
      "type": "number",
      "description": "Calculated Body Mass Index"
    },
    "category": {
      "type": "string",
      "description": "BMI category according to WHO standards"
    }
  }
});

  process.exit(0);
}

// MCP Server
const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");

const server = new Server(
  {
    name: "BMI Calculator",
    version: "0.1.0"
  },
  {
    capabilities: { tools: {} }
  }
);

server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "Calculate BMI",
        description: "Calculates BMI based on weight and height and categorizes it.",
        inputSchema: {
  "type": "object",
  "properties": {
    "weight": {
      "type": "number",
      "description": "Weight in kilograms"
    },
    "height": {
      "type": "number",
      "description": "Height in centimeters"
    }
  },
  "required": [
    "weight",
    "height"
  ]
}
      }
    ]
  };
});

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "Calculate BMI") {
    // For now, return dummy output matching schema
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          "bmi": null,
          "category": null
        }, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("BMI Calculator MCP Server running");
}

main().catch(console.error);
