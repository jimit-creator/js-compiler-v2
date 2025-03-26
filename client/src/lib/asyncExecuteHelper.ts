/**
 * Helper functions for working with asynchronous code execution
 */

/**
 * Formats Promise objects in console logs to be more user-friendly
 * @param value Any value that might be a Promise
 * @returns A string representation or the original value
 */
export function formatPromiseForConsole(value: any): any {
  if (value && typeof value === 'object' && typeof value.then === 'function') {
    return '[Promise - use await to resolve it]';
  }
  return value;
}

/**
 * A helper guide for users about handling Promises
 */
export const asyncCodeGuide = `
// To properly work with asynchronous code, use async/await:

// ❌ This will show [object Promise] in the console:
const fetchData = async () => {
  return { message: 'Hello!' };
};
const result = fetchData();
console.log(result); // Shows [object Promise]

// ✅ This will show the actual data:
const fetchData = async () => {
  return { message: 'Hello!' };
};

// Method 1: Using an async IIFE (Immediately Invoked Function Expression)
(async () => {
  const result = await fetchData();
  console.log(result); // Shows { message: 'Hello!' }
})();

// Method 2: Define and call an async function
async function displayData() {
  const result = await fetchData();
  console.log(result); // Shows { message: 'Hello!' }
}
displayData();
`;