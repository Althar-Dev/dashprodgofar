const axios = require("axios");
const chalk = require("chalk").default;

const API_BASE_URL = "http://localhost:9002/api";
const API_KEY = "gofarbotapi";
const BOT_ID = 220208;
const TEST_USER_ID = "123456789";
const TEST_USER_NAME = "Test User";
const TEST_PRODUCT_ID = `test-product-${Date.now()}`;
const TEST_SEWA_ID = `test-sewa-${Date.now()}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
  timeout: 10000,
});

function logResult(name, ok, details) {
  const status = ok ? chalk.green("✓") : chalk.red("✗");
  console.log(`${status} ${name}`);
  if (details) {
    console.log(chalk.gray(details));
  }
}

async function testEndpoint(name, fn) {
  process.stdout.write(chalk.blue(`⏳ ${name}... `));
  try {
    const response = await fn();
    console.log(chalk.green("DONE"));
    console.log(chalk.gray(JSON.stringify(response.data, null, 2)));
    return { name, success: true, status: response.status, body: response.data };
  } catch (error) {
    console.log(chalk.red("FAILED"));
    return { name, success: false, error };
  }
}

async function runChecks() {
  console.log(chalk.cyan("\n========== Database Connection Check =========="));
  console.log(chalk.yellow("📡 Testing connection to:"), API_BASE_URL);
  console.log(chalk.gray(`   Using API Key: ${API_KEY}\n`));

  const results = [];

  results.push(
    await testEndpoint("Bot init (/bot/init)", async () =>
      api.post("/bot/init", { id: BOT_ID, name: "Test Bot" })
    )
  );

  results.push(
    await testEndpoint("User check (/user/check)", async () =>
      api.post("/user/check", { id: TEST_USER_ID, name: TEST_USER_NAME })
    )
  );

  results.push(
    await testEndpoint("Product list (/product/list/:botId)", async () =>
      api.get(`/product/list/${BOT_ID}`)
    )
  );

  results.push(
    await testEndpoint("Add stock (/product/stock)", async () =>
      api.post("/product/stock", { botId: BOT_ID, id: TEST_PRODUCT_ID, accounts: ["account1", "account2"] })
    )
  );

  results.push(
    await testEndpoint("Delete product (/product/delete)", async () =>
      api.post("/product/delete", { botId: BOT_ID, id: TEST_PRODUCT_ID })
    )
  );

  results.push(
    await testEndpoint("Transaction process (/transaction/process)", async () =>
      api.post("/transaction/process", {
        botId: BOT_ID,
        userId: TEST_USER_ID,
        productId: TEST_PRODUCT_ID,
        qty: 1,
        total: 1,
        paymentMethod: "test",
      })
    )
  );

  results.push(
    await testEndpoint("Sewa register (/sewa/register)", async () =>
      api.post("/sewa/register", {
        botId: BOT_ID,
        id: TEST_SEWA_ID,
        name: "Test Sewa",
        pin: "1234",
      })
    )
  );

  results.push(
    await testEndpoint("Sewa stats (/sewa/stats)", async () =>
      api.post("/sewa/stats", { botId: BOT_ID, sewaId: TEST_SEWA_ID })
    )
  );

  console.log(chalk.cyan("\n========== Test Summary =========="));

  let allOk = true;
  for (const result of results) {
    if (result.success) {
      const statusLine = `Status: ${result.status} - Response: ${JSON.stringify(result.body)}`;
      logResult(result.name, true, statusLine);
    } else {
      allOk = false;
      const err = result.error;
      const message = err.response
        ? `HTTP ${err.response.status} - ${err.response.data?.message || err.response.data?.error || JSON.stringify(err.response.data)}`
        : err.request
        ? "No response from server"
        : err.message;
      logResult(result.name, false, message);
    }
  }

  console.log(chalk.cyan("=================================\n"));

  if (allOk) {
    console.log(chalk.greenBright("✅ Semua endpoint berhasil dicek."));
  } else {
    console.log(chalk.redBright("⚠️  Beberapa endpoint gagal atau merespon dengan error."));
    console.log(chalk.gray("Silakan periksa log di atas untuk detail endpoint yang gagal."));
  }
}

runChecks();