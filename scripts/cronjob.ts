import cron from "node-cron";

const BASE_URL = "http://bitpot.netlify.app";
async function hit(path: string) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
    });

    const data = await res.json();

    console.log(`[${new Date().toISOString()}]`, path, data);
  } catch (err) {
    console.error(`[${new Date().toISOString()}]`, path, err);
  }
}

// every 10 seconds for testing
cron.schedule("*/10 * * * * *", async () => {
  console.log("Running keeper...");

  await hit("/api/request-draw");
  await hit("/api/fulfill-draw");
});

console.log("Keeper started");
