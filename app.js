
// import readline from "readline";
// import fetch from "node-fetch";
// import fs from "fs";
// import { exec } from "child_process";

// const OPENROUTER_API_KEY = "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"; // replace with your real key

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question("Enter your MCP tool request: ", async (userPrompt) => {
//   try {
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${OPENROUTER_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: "openai/gpt-4o-mini",
//         messages: [
//           {
//             role: "system",
//             content: `You are an assistant that ONLY outputs valid JSON for MCP tool specifications. 
// The JSON MUST have this exact structure:

// {
//   "name": string,
//   "description": string,
//   "version": "0.1.0",
//   "tools": [
//     {
//       "name": string,
//       "description": string,
//       "inputSchema": {
//         "type": "object",
//         "properties": {
//           ...
//         },
//         "required": [...]
//       },
//       "outputSchema": {
//         "type": "object",
//         "properties": {
//           ...
//         }
//       }
//     }
//   ]
// }

// No explanations, no extra text, no code fences.`
//           },
//           { role: "user", content: userPrompt }
//         ],
//         temperature: 0.0
//       })
//     });

//     const data = await response.json();
//     let rawOutput = data?.choices?.[0]?.message?.content?.trim();

//     if (!rawOutput) {
//       console.error("❌ No response from model:", data);
//       return;
//     }

//     // cleanup ```json fences if they sneak in
//     rawOutput = rawOutput.replace(/```json\s*/i, "").replace(/```$/i, "").trim();

//     try {
//       let parsed = JSON.parse(rawOutput);

//       fs.writeFileSync("spec.json", JSON.stringify(parsed, null, 2));
//       console.log("\n✅ JSON saved to spec.json");

//       // run generator automatically
//       console.log("\n⚙️  Running generator.js ...\n");
//       exec("node generator.js", (error, stdout, stderr) => {
//         if (error) {
//           console.error(`❌ Generator failed: ${error.message}`);
//           return;
//         }
//         if (stderr) console.error(stderr);
//         console.log(stdout);
//         console.log("🎉 MCP project generated in /mcp-generated");
//       });

//     } catch (err) {
//       console.error("❌ Model output was not valid JSON after cleanup:\n", rawOutput);
//     }

//   } catch (err) {
//     console.error("Error calling OpenRouter:", err);
//   } finally {
//     rl.close();
//   }
// });







// import readline from "readline";
// import fetch from "node-fetch";
// import fs from "fs";
// import { exec } from "child_process";

// const OPENROUTER_API_KEY = "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"; // replace with real key
// const MAX_RETRIES = 3;

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// // ------------------ Helper to call OpenRouter ------------------
// async function callLLM(messages) {
//   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${OPENROUTER_API_KEY}`
//     },
//     body: JSON.stringify({
//       model: "openai/gpt-4o-mini",
//       messages,
//       temperature: 0.0
//     })
//   });
//   const data = await response.json();
//   return data?.choices?.[0]?.message?.content?.trim();
// }

// // ------------------ Cleanup JSON string ------------------
// function cleanRawJSON(raw) {
//   return raw
//     .replace(/```json\s*/i, "")
//     .replace(/```$/i, "")
//     .replace(/'/g, '"')
//     .trim();
// }

// // ------------------ Validation via LLM ------------------
// async function validateJSON(jsonString) {
//   const validationPrompt = `
// You are an assistant that checks if a JSON matches the required MCP tool specification.
// Required structure:
// {
//   "name": string,
//   "description": string,
//   "version": "0.1.0",
//   "tools": [
//     {
//       "name": string,
//       "description": string,
//       "inputSchema": { "type": "object", "properties": { ... }, "required": [...] },
//       "outputSchema": { "type": "object", "properties": { ... } }
//     }
//   ]
// }
// JSON to check:
// ${jsonString}
// Respond ONLY with "VALID" or "INVALID".
// `;
//   const result = await callLLM([
//     { role: "system", content: validationPrompt }
//   ]);
//   return result?.toUpperCase() === "VALID";
// }

// // ------------------ Main flow ------------------
// rl.question("Enter your MCP tool request: ", async (userPrompt) => {
//   let attempts = 0;
//   let parsedJSON = null;

//   while (attempts < MAX_RETRIES) {
//     attempts++;

//     try {
//       // Step 1: Generate JSON from user prompt
//       let rawOutput = await callLLM([
//         {
//           role: "system",
//           content: `You are an assistant that ONLY outputs valid JSON for MCP tool specifications.
// The JSON MUST have this exact structure:
// {
//   "name": string,
//   "description": string,
//   "version": "0.1.0",
//   "tools": [
//     {
//       "name": string,
//       "description": string,
//       "inputSchema": {
//         "type": "object",
//         "properties": { ... },
//         "required": [...]
//       },
//       "outputSchema": {
//         "type": "object",
//         "properties": { ... }
//       }
//     }
//   ]
// }
// No explanations, no extra text, no code fences.`
//         },
//         { role: "user", content: userPrompt }
//       ]);

//       if (!rawOutput) {
//         console.error("❌ No response from model");
//         break;
//       }

//       rawOutput = cleanRawJSON(rawOutput);

//       // Step 2: Parse JSON
//       parsedJSON = JSON.parse(rawOutput);

//       // Step 3: Validate JSON with LLM
//       const isValid = await validateJSON(JSON.stringify(parsedJSON));
//       if (isValid) {
//         console.log("✅ JSON validated by LLM");
//         break;
//       } else {
//         console.warn(`⚠️ JSON invalid. Retrying (${attempts}/${MAX_RETRIES})...`);
//         parsedJSON = null;
//       }

//     } catch (err) {
//       console.error("❌ Error parsing or validating JSON:", err);
//       parsedJSON = null;
//     }
//   }

//   if (!parsedJSON) {
//     console.error("❌ Failed to generate valid MCP JSON after maximum retries.");
//     rl.close();
//     return;
//   }

//   // Step 4: Save valid JSON
//   fs.writeFileSync("spec.json", JSON.stringify(parsedJSON, null, 2));
//   console.log("\n✅ JSON saved to spec.json");

//   // Step 5: Run generator
//   console.log("\n⚙️  Running generator.js ...\n");
//   exec("node generator.js", (error, stdout, stderr) => {
//     if (error) {
//       console.error(`❌ Generator failed: ${error.message}`);
//       rl.close();
//       return;
//     }
//     if (stderr) console.error(stderr);
//     console.log(stdout);
//     console.log("🎉 MCP project generated in /mcp-generated");
//     rl.close();
//   });
// });





import readline from "readline";
import fetch from "node-fetch";
import fs from "fs";
import { exec } from "child_process";

const OPENROUTER_API_KEY = "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"; // replace with real key
const MAX_RETRIES = 3;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ------------------ Helper to call OpenRouter ------------------
async function callLLM(messages) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages,
      temperature: 0.0
    })
  });
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim();
}

// ------------------ Cleanup JSON string ------------------
function cleanRawJSON(raw) {
  return raw
    .replace(/```json\s*/i, "")
    .replace(/```$/i, "")
    .replace(/'/g, '"')
    .trim();
}

// ------------------ Validation via LLM ------------------
async function validateJSON(jsonString) {
  const validationPrompt = `
You are an assistant that checks if a JSON matches the required MCP tool specification.
Required structure:
{
  "name": string,
  "description": string,
  "version": "0.1.0",
  "tools": [
    {
      "name": string,
      "description": string,
      "inputSchema": { "type": "object", "properties": { ... }, "required": [...] },
      "outputSchema": { "type": "object", "properties": { ... } }
    }
  ]
}
JSON to check:
${jsonString}
Respond ONLY with "VALID" or "INVALID".
`;
  const result = await callLLM([
    { role: "system", content: validationPrompt }
  ]);
  return result?.toUpperCase() === "VALID";
}

// ------------------ Main flow ------------------
rl.question("Enter your MCP tool request: ", async (userPrompt) => {
  let attempts = 0;
  let parsedJSON = null;

  while (attempts < MAX_RETRIES) {
    attempts++;

    try {
      // Step 1: Generate JSON from user prompt
      let rawOutput = await callLLM([
        {
          role: "system",
          content: `You are an assistant that ONLY outputs valid JSON for MCP tool specifications.
The JSON MUST have this exact structure:
{
  "name": string,
  "description": string,
  "version": "0.1.0",
  "tools": [
    {
      "name": string,
      "description": string,
      "inputSchema": {
        "type": "object",
        "properties": { ... },
        "required": [...]
      },
      "outputSchema": {
        "type": "object",
        "properties": { ... }
      }
    }
  ]
}
No explanations, no extra text, no code fences.`
        },
        { role: "user", content: userPrompt }
      ]);

      if (!rawOutput) {
        console.error("❌ No response from model");
        break;
      }

      rawOutput = cleanRawJSON(rawOutput);

      // Step 2: Parse JSON
      parsedJSON = JSON.parse(rawOutput);

      // Step 3: Validate JSON with LLM
      const isValid = await validateJSON(JSON.stringify(parsedJSON));
      if (isValid) {
        console.log("✅ JSON validated by LLM");
        break;
      } else {
        console.warn(`⚠️ JSON invalid. Retrying (${attempts}/${MAX_RETRIES})...`);
        parsedJSON = null;
      }

    } catch (err) {
      console.error("❌ Error parsing or validating JSON:", err);
      parsedJSON = null;
    }
  }

  if (!parsedJSON) {
    console.error("❌ Failed to generate valid MCP JSON after maximum retries.");
    rl.close();
    return;
  }

  // Step 4: Save valid JSON
  fs.writeFileSync("spec.json", JSON.stringify(parsedJSON, null, 2));
  console.log("\n✅ JSON saved to spec.json");

  // Step 5: Run generator
  console.log("\n⚙️  Running generator.js ...\n");
  exec("node generator.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Generator failed: ${error.message}`);
      rl.close();
      return;
    }
    if (stderr) console.error(stderr);
    console.log(stdout);
    console.log("🎉 MCP project generated in /mcp-generated");
    rl.close();
  });
});
