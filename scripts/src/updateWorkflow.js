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

const getLatestWorkflow = async () => {
  const username = "pulkitxm";
  const repoName = username;
  try {
    const response = await octokit.actions.listWorkflowRunsForRepo({
      owner: username,
      repo: repoName,
    });
    return {
      count: response.data.total_count,
      timeStamp: response.data.workflow_runs[0].created_at,
    };
  } catch (error) {
    console.error(error.message);
    return {
      count: 0,
      timeStamp: TODAY.toISOString(),
    };
  }
};

export async function updateWorkflowNumber() {
  const workflowDetails = await getLatestWorkflow();
  const count = workflowDetails.count;
  const time =
    new Date(workflowDetails.timeStamp).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " IST";

  const readmeContent = readFileSync(READMEFILE_PATH, "utf-8");

  const updatedContent = readmeContent.replace(
    /(?<=<!--START_SECTION:workflows-update-->\n)[\s\S]*(?=\n<!--END_SECTION:workflows-update-->)/,
    `\n<p align="center">
      This <i>README</i> file is refreshed <b>every 24 hours</b>!<br/>
      Last refresh: <b>${time}</b><br/>
      Number of workflows: <b>${count}</b><br/><br/>
      Made with ❤️ by Pulkit
    </p>\n`,
  );

  writeFileSync(READMEFILE_PATH, updatedContent, "utf-8");
  console.log(`README file updated with the latest workflow count(${count}).`);
}
