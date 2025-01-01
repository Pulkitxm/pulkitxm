import { exec } from "child_process";
import { DATA_DIR, TODAY } from "./config.js";
import { handleFetchFollowers } from "./fetchFollowers.js";
import { handleFetchBlogs } from "./fetchLatestBlogPosts.js";
import { writeFileSync, mkdirSync, renameSync, rmSync, existsSync } from "fs";
import { updateWorkflowNumber } from "./updateWorkflow.js";

async function main() {
  console.log("Starting data fetch process...");

  try {
    console.log("Fetching followers and blogs...");
    const [followers, blogs] = await Promise.all([
      handleFetchFollowers(),
      handleFetchBlogs(),
    ]);
    await updateWorkflowNumber();
    console.log(
      `Successfully fetched ${followers.length} followers and ${blogs.length} blogs, respectively.`,
    );

    const TODAY_DIR_NAME = `${TODAY.getDate()}-${TODAY.getMonth() + 1}-${TODAY.getFullYear()}`;
    const targetDir = `${DATA_DIR}/${TODAY_DIR_NAME}`;

    console.log(`Creating directory: ${DATA_DIR}`);
    mkdirSync(`${DATA_DIR}`, { recursive: true });

    console.log(`Creating temporary directory: ${TODAY_DIR_NAME}`);
    mkdirSync(`${TODAY_DIR_NAME}`, { recursive: true });

    console.log("Writing followers data...");
    writeFileSync(
      `${TODAY_DIR_NAME}/followers.json`,
      JSON.stringify(followers, null, 2),
    );

    console.log("Writing blogs data...");
    writeFileSync(
      `${TODAY_DIR_NAME}/blogs.json`,
      JSON.stringify(blogs, null, 2),
    );

    console.log("Running formatter...");
    exec("npm run format", (err, stdout, stderr) => {
      if (err) {
        console.error("Formatting failed:", err);
        return;
      }
      console.log("Formatting completed:", stdout);
    });

    if (existsSync(targetDir)) {
      rmSync(targetDir, { recursive: true });
    }
    renameSync(TODAY_DIR_NAME, targetDir);
    console.log(`Renamed ${TODAY_DIR_NAME} to ${targetDir}`);

    console.log("Process completed successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

main();
