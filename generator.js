// import fs from "fs";
// import Handlebars from "handlebars";

// // JSON pretty printer
// Handlebars.registerHelper("json", function(context) {
//   return JSON.stringify(context, null, 2);
// });

// // 🆕 Convert JSON Schema → Zod schema
// Handlebars.registerHelper("zodFromSchema", function(schema) {
//   if (!schema || schema.type !== "object") return "z.any()";

//   const props = Object.entries(schema.properties || {})
//     .map(([key, def]) => {
//       let zodType = "z.any()";
//       if (def.type === "number") zodType = "z.number()";
//       else if (def.type === "string") zodType = "z.string()";
//       else if (def.type === "boolean") zodType = "z.boolean()";

//       const isRequired = schema.required?.includes(key);
//       if (!isRequired) zodType += ".optional()";

//       return `${key}: ${zodType}`;
//     })
//     .join(",\n    ");

//   return `z.object({\n    ${props}\n  })`;
// });

// // Load templates
// const serverTemplate = fs.readFileSync("templates/server.ts.hbs", "utf8");
// const mcpTemplate = fs.readFileSync("templates/mcp.json.hbs", "utf8");
// const pkgTemplate = fs.readFileSync("templates/package.json.hbs", "utf8");

// // Load spec.json
// const spec = JSON.parse(fs.readFileSync("spec.json", "utf8"));

// // Ensure output dir
// if (!fs.existsSync("mcp-generated")) {
//   fs.mkdirSync("mcp-generated");
// }

// // Compile templates → write files
// fs.writeFileSync("mcp-generated/server.ts", Handlebars.compile(serverTemplate)(spec));
// fs.writeFileSync("mcp-generated/mcp.json", Handlebars.compile(mcpTemplate)(spec));
// fs.writeFileSync("mcp-generated/package.json", Handlebars.compile(pkgTemplate)(spec));

// console.log("✅ Generated files in mcp-generated/");


import fs from "fs";
import Handlebars from "handlebars";

// JSON pretty printer
Handlebars.registerHelper("json", function(context) {
  return JSON.stringify(context, null, 2);
});

// 🆕 Equality check helper (for conditional logic in templates)
Handlebars.registerHelper("eq", function(a, b) {
  return a === b;
});

// 🆕 Convert JSON Schema → Zod schema
Handlebars.registerHelper("zodFromSchema", function(schema) {
  if (!schema || schema.type !== "object") return "z.any()";

  const props = Object.entries(schema.properties || {})
    .map(([key, def]) => {
      let zodType = "z.any()";
      if (def.type === "number") zodType = "z.number()";
      else if (def.type === "string") zodType = "z.string()";
      else if (def.type === "boolean") zodType = "z.boolean()";

      const isRequired = schema.required?.includes(key);
      if (!isRequired) zodType += ".optional()";

      return `${key}: ${zodType}`;
    })
    .join(",\n    ");

  return `z.object({\n    ${props}\n  })`;
});

// Load templates
const serverTemplate = fs.readFileSync("templates/server.ts.hbs", "utf8");
const mcpTemplate = fs.readFileSync("templates/mcp.json.hbs", "utf8");
const pkgTemplate = fs.readFileSync("templates/package.json.hbs", "utf8");

// Load spec.json
const spec = JSON.parse(fs.readFileSync("spec.json", "utf8"));

// Ensure output dir
if (!fs.existsSync("mcp-generated")) {
  fs.mkdirSync("mcp-generated");
}

// Compile templates → write files
fs.writeFileSync("mcp-generated/server.ts", Handlebars.compile(serverTemplate)(spec));
fs.writeFileSync("mcp-generated/mcp.json", Handlebars.compile(mcpTemplate)(spec));
fs.writeFileSync("mcp-generated/package.json", Handlebars.compile(pkgTemplate)(spec));

console.log("✅ Generated files in mcp-generated/");
