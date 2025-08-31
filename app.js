

// import readline from "readline";
// import fetch from "node-fetch";
// import fs from "fs";
// import { exec } from "child_process";

// // const OPENROUTER_API_KEY = "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"; // replace with real key
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
  try {
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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim();
  } catch (error) {
    console.error("❌ API call failed:", error.message);
    return null;
  }
}

// ------------------ Enhanced JSON extraction and cleanup ------------------
function extractAndCleanJSON(raw) {
  if (!raw) return "";
  
  console.log("🔍 Raw response length:", raw.length);
  console.log("🔍 First 100 chars:", JSON.stringify(raw.substring(0, 100)));
  
  // Step 1: Remove markdown code fences and common prefixes
  let cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .replace(/^Here's the JSON.*?:\s*/gi, "")
    .replace(/^JSON:\s*/gi, "")
    .trim();
  
  // Step 2: Find the actual JSON object
  const openBrace = cleaned.indexOf("{");
  if (openBrace === -1) {
    throw new Error("No opening brace found in response");
  }
  
  // Count braces to find the complete JSON object
  let braceCount = 0;
  let endPos = -1;
  
  for (let i = openBrace; i < cleaned.length; i++) {
    if (cleaned[i] === "{") {
      braceCount++;
    } else if (cleaned[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        endPos = i;
        break;
      }
    }
  }
  
  if (endPos === -1) {
    throw new Error("No closing brace found - incomplete JSON");
  }
  
  const jsonStr = cleaned.substring(openBrace, endPos + 1);
  
  // Step 3: Final cleanup
  const finalJSON = jsonStr
    .replace(/^\uFEFF/, "") // Remove BOM
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width chars
    .replace(/'/g, '"') // Fix quotes
    .trim();
    
  console.log("🧹 Final JSON length:", finalJSON.length);
  console.log("🧹 First 100 chars of final JSON:", JSON.stringify(finalJSON.substring(0, 100)));
  
  return finalJSON;
}

// ------------------ Validation via LLM ------------------
async function validateJSON(jsonString) {
  const validationPrompt = `You are an assistant that checks if a JSON matches the required MCP tool specification.

Required structure:
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

JSON to check:
${jsonString}

Respond ONLY with "VALID" or "INVALID".`;

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
    console.log(`Attempt ${attempts} of ${MAX_RETRIES}: Generating JSON...`);
    
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

CRITICAL: Output ONLY the JSON object. No explanations, no extra text, no code fences, no markdown.`
        },
        { role: "user", content: userPrompt }
      ]);

      if (!rawOutput) {
        console.error("❌ No response from model");
        continue;
      }

      // Step 2: Extract and clean JSON
      const cleanedJSON = extractAndCleanJSON(rawOutput);

      // Step 3: Parse JSON
      parsedJSON = JSON.parse(cleanedJSON);
      console.log("✅ JSON parsed successfully");

      // Step 4: Validate JSON with LLM
      const isValid = await validateJSON(JSON.stringify(parsedJSON));
      
      if (isValid) {
        console.log("✅ JSON validated by LLM");
        break;
      } else {
        console.warn(`⚠️ JSON invalid. Retrying (${attempts}/${MAX_RETRIES})...`);
        parsedJSON = null;
      }
      
    } catch (err) {
      console.error(`❌ Error on attempt ${attempts}:`, err.message);
      if (rawOutput) {
        console.log("🔍 Raw output sample:", JSON.stringify(rawOutput.substring(0, 200)) + "...");
      }
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
  console.log("\n⚙️ Running generator.js ...\n");
  exec("node generator.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Generator failed: ${error.message}`);
      rl.close();
      return;
    }
    
    if (stderr) console.error("⚠️ Generator warnings:", stderr);
    console.log(stdout);
    console.log("🎉 MCP project generated in /mcp-generated");
    
    rl.close();
  });
});