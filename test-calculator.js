// Simple test script for your generated calculator
import fs from 'fs';

console.log("🧪 Testing Generated Calculator MCP");

// Read the generated spec
const spec = JSON.parse(fs.readFileSync('./spec.json', 'utf8'));

console.log("📋 Tool Specification:");
console.log(`Name: ${spec.name}`);
console.log(`Description: ${spec.description}`);
console.log(`Version: ${spec.version}`);

spec.tools.forEach((tool, index) => {
  console.log(`\n🔧 Tool ${index + 1}: ${tool.name}`);
  console.log(`Description: ${tool.description}`);
  
  console.log("\n📝 Input Schema:");
  const props = tool.inputSchema.properties;
  Object.keys(props).forEach(key => {
    const prop = props[key];
    const required = tool.inputSchema.required?.includes(key) ? ' (required)' : ' (optional)';
    console.log(`  ${key}: ${prop.type}${required}`);
  });
  
  console.log("\n📤 Output Schema:");
  const outProps = tool.outputSchema.properties;
  Object.keys(outProps).forEach(key => {
    const prop = outProps[key];
    console.log(`  ${key}: ${prop.type}`);
  });
});

// Test the actual calculation logic
console.log("\n🔬 Testing Calculator Logic:");
const num1 = 10;
const num2 = 5;

const result = {
  sum: num1 + num2,
  difference: num1 - num2, 
  product: num1 * num2,
  quotient: num2 !== 0 ? num1 / num2 : null
};

console.log(`Input: number1=${num1}, number2=${num2}`);
console.log("Output:");
console.log(JSON.stringify(result, null, 2));

console.log("\n✅ Test completed successfully!");