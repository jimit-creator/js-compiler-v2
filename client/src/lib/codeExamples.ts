interface CodeExample {
  title: string;
  code: string;
}

export const defaultCode = `// JavaScript Online Compiler
// Type your code here and hit Run

console.log("Hello, World!");

// Example function
function greeting(name) {
  return \`Hello, \${name}!\`;
}

// Try calling the function
const message = greeting("Developer");
console.log(message);

// Working with arrays
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log("Doubled array:", doubled);

// Try using async/await
async function fetchData() {
  try {
    console.log("Fetching data...");
    // This would be a real API call in a browser environment
    return { status: "success", data: { message: "Data fetched successfully" } };
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Call the async function
fetchData().then(result => {
  console.log("Result:", result);
});`;

export const codeExamples: CodeExample[] = [
  {
    title: "Hello World",
    code: `// Simple Hello World program
console.log("Hello, World!");

// Using a template string
const name = "JavaScript";
console.log(\`Hello, \${name}!\`);`
  },
  {
    title: "Fetch API Example",
    code: `// Fetch API Example
// Note: This works in a browser environment
// In this sandbox, we'll simulate a response

// Simulating fetch in our sandbox
async function fetchUserData() {
  console.log("Fetching user data...");
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate response data
  return {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    isActive: true
  };
}

// Using the fetch function with async/await
async function displayUserInfo() {
  try {
    const userData = await fetchUserData();
    console.log("User data received:", userData);
    
    // Process the data
    console.log(\`User: \${userData.name}\`);
    console.log(\`Email: \${userData.email}\`);
    console.log(\`Status: \${userData.isActive ? "Active" : "Inactive"}\`);
    
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

// Call the function
displayUserInfo();`
  },
  {
    title: "Array Methods",
    code: `// Array Methods Example

const fruits = ["Apple", "Banana", "Orange", "Mango", "Pineapple"];
console.log("Original array:", fruits);

// forEach - iterate over array elements
console.log("\\nForEach example:");
fruits.forEach((fruit, index) => {
  console.log(\`\${index + 1}. \${fruit}\`);
});

// map - create a new array by transforming each element
console.log("\\nMap example:");
const upperFruits = fruits.map(fruit => fruit.toUpperCase());
console.log("Uppercase fruits:", upperFruits);

// filter - create a new array with elements that pass a test
console.log("\\nFilter example:");
const longFruits = fruits.filter(fruit => fruit.length > 5);
console.log("Fruits with more than 5 characters:", longFruits);

// reduce - reduce array to a single value
console.log("\\nReduce example:");
const totalLength = fruits.reduce((sum, fruit) => sum + fruit.length, 0);
console.log("Total length of all fruit names:", totalLength);

// sort - sort the array
console.log("\\nSort example:");
const sortedFruits = [...fruits].sort();
console.log("Sorted fruits:", sortedFruits);

// find - find the first element that passes a test
console.log("\\nFind example:");
const foundFruit = fruits.find(fruit => fruit.startsWith("B"));
console.log("First fruit starting with B:", foundFruit);`
  },
  {
    title: "Async/Await",
    code: `// Async/Await Example

// Simulate an API call with a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulated API functions
async function fetchUserProfile() {
  console.log("Fetching user profile...");
  await delay(1000);
  return {
    id: 42,
    username: "javascript_lover",
    name: "John Doe"
  };
}

async function fetchUserPosts(userId) {
  console.log(\`Fetching posts for user \${userId}...\`);
  await delay(1500);
  return [
    { id: 1, title: "Async/Await is awesome", content: "Here's why..." },
    { id: 2, title: "JavaScript tips and tricks", content: "Learn these..." }
  ];
}

async function fetchPostComments(postId) {
  console.log(\`Fetching comments for post \${postId}...\`);
  await delay(800);
  return [
    { id: 101, text: "Great post!", author: "user1" },
    { id: 102, text: "Thanks for sharing!", author: "user2" }
  ];
}

// Using async/await to handle the sequence of API calls
async function loadUserData() {
  try {
    // First fetch the user profile
    const user = await fetchUserProfile();
    console.log("User profile:", user);
    
    // Then fetch the user's posts
    const posts = await fetchUserPosts(user.id);
    console.log("User posts:", posts);
    
    // Then fetch comments for the first post
    if (posts.length > 0) {
      const comments = await fetchPostComments(posts[0].id);
      console.log(\`Comments for post "\${posts[0].title}":\`, comments);
    }
    
    console.log("All data loaded successfully!");
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// Execute the function
loadUserData();`
  }
];
