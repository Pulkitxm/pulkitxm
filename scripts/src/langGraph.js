import dotenv from "dotenv";
dotenv.config();

if (process.env.ACCESS_TOKEN === undefined) {
  console.error("Please provide ACCESS_TOKEN in .env file");
  process.exit(1);
}

import { Octokit } from "@octokit/rest";
import axios from "axios";
import fs from "fs";

async function getAllRepositories(octokit) {
  try {
    const repos = await octokit.paginate(
      octokit.repos.listForAuthenticatedUser,
      {
        per_page: 100,
        affiliation: "owner",
        sort: "updated",
        direction: "desc",
      },
    );

    const nonForkedRepos = repos.filter((repo) => !repo.fork);
    console.log(`Fetched ${nonForkedRepos.length} non-forked repositories`);
    return nonForkedRepos;
  } catch (error) {
    console.log(`Error fetching repositories: ${error.message}`);
    throw error;
  }
}

async function getLanguageStats(octokit, repos) {
  const languageStats = {};

  for (const repo of repos) {
    try {
      const languages = await octokit.repos.listLanguages({
        owner: repo.owner.login,
        repo: repo.name,
      });

      for (const [language, bytes] of Object.entries(languages.data)) {
        languageStats[language] = (languageStats[language] || 0) + bytes;
      }
      console.log(`Processed languages for ${repo.name}`);
    } catch (error) {
      console.log(
        `Error fetching languages for ${repo.name}: ${error.message}`,
      );
    }
  }

  return languageStats;
}

async function main() {
  try {
    if (!process.env.ACCESS_TOKEN) {
      throw new Error(
        "GitHub token not found. Please set ACCESS_TOKEN in .env file.",
      );
    }

    const octokit = new Octokit({ auth: process.env.ACCESS_TOKEN });

    console.log("Starting repository and language analysis...");

    const repos = await getAllRepositories(octokit);
    const languageStats = await getLanguageStats(octokit, repos);

    console.log(languageStats);

    console.log("Analysis completed successfully!");
  } catch (error) {
    console.log(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
