import dotenv from "dotenv";
dotenv.config();

if (process.env.ACCESS_TOKEN === undefined) {
  console.error("Please provide ACCESS_TOKEN in .env file");
  process.exit(1);
}

import { Octokit } from "@octokit/rest";
import { readFileSync, writeFileSync } from "fs";
import { READMEFILE_PATH } from "./config.js";

const octokit = new Octokit({
  auth: process.env.ACCESS_TOKEN,
});

const getWorflowCount = async () => {
  const username = "pulkitxm";
  const repoName = username;
  try {
    const response = await octokit.actions.listWorkflowRunsForRepo({
      owner: username,
      repo: repoName,
    });
    return response.data.total_count;
  } catch (error) {
    console.error(error.message);
    return 0;
  }
};

export async function updateWorkflowNumber() {
  const workflowCount = await getWorflowCount();
  const readmeContent = readFileSync(READMEFILE_PATH, "utf-8");

  // *Note: All the data displayed above is updated automatically via GitHub Actions. There have been **3** workflow runs so far.*
  const updatedContent = readmeContent.replace(
    /Note: All the data displayed above is updated automatically via GitHub Actions. There have been \*\*\d+\*\* workflow runs so far./,
    `Note: All the data displayed above is updated automatically via GitHub Actions. There have been **${workflowCount}** workflow runs so far.`
  );

  writeFileSync(READMEFILE_PATH, updatedContent, "utf-8");
  console.log(
    `README file updated with the latest workflow count(${workflowCount}).`
  );
}
