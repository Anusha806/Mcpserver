
import fs from "fs";
import Handlebars from "handlebars";

// JSON pretty printer with triple braces to avoid HTML escaping
Handlebars.registerHelper("json", function(context) {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

// Equality check helper
Handlebars.registerHelper("eq", function(a, b) {
  return a === b;
});

// Convert JSON Schema → Zod schema
Handlebars.registerHelper("zodFromSchema", function(schema) {
  if (!schema || schema.type !== "object") return "z.any()";
  
  const props = Object.entries(schema.properties || {})
    .map(([key, def]) => {
      let zodType = "z.any()";
      if (def.type === "number" || def.type === "integer") {
        zodType = "z.number()";
      } else if (def.type === "string") {
        zodType = "z.string()";
      } else if (def.type === "boolean") {
        zodType = "z.boolean()";
      } else if (def.type === "array") {
        zodType = "z.array(z.any())";
      } else if (def.type === "object") {
        zodType = "z.object({})";
      }
      
      const isRequired = schema.required?.includes(key);
      if (!isRequired) zodType += ".optional()";
      
      return `  ${key}: ${zodType}`;
    })
    .join(",\n");
    
  return `z.object({\n${props}\n})`;
});

try {
  // Load templates
  const serverTemplate = fs.readFileSync("templates/server.ts.hbs", "utf8");
  const mcpTemplate = fs.readFileSync("templates/mcp.json.hbs", "utf8");
  const pkgTemplate = fs.readFileSync("templates/package.json.hbs", "utf8");

  // Load spec.json
  if (!fs.existsSync("spec.json")) {
    console.error("❌ spec.json not found!");
    process.exit(1);
  }

  const spec = JSON.parse(fs.readFileSync("spec.json", "utf8"));
  
  // Ensure output dir
  if (!fs.existsSync("mcp-generated")) {
    fs.mkdirSync("mcp-generated", { recursive: true });
  }

  // Compile templates → write files
  fs.writeFileSync("mcp-generated/server.ts", Handlebars.compile(serverTemplate)(spec));
  fs.writeFileSync("mcp-generated/mcp.json", Handlebars.compile(mcpTemplate)(spec));
  fs.writeFileSync("mcp-generated/package.json", Handlebars.compile(pkgTemplate)(spec));

  console.log("✅ Generated files in mcp-generated/");
  console.log("📁 Files created:");
  console.log("  - server.ts");
  console.log("  - mcp.json"); 
  console.log("  - package.json");
  
} catch (error) {
  console.error("❌ Generator failed:", error.message);
  process.exit(1);
}