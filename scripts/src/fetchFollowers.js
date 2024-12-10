import dotenv from "dotenv";
dotenv.config();

console.log(process.env.ACCESS_TOKEN);

import { Octokit } from "@octokit/rest";
import { readFileSync, writeFileSync } from "fs";
import { READMEFILE_PATH } from "./config.js";

const octokit = new Octokit({
  auth: process.env.ACCESS_TOKEN,
});

const getLatestFollowers = async () => {
  const username = "pulkitxm";
  try {
    const { data } = await octokit.rest.users.listFollowersForAuthenticatedUser(
      {
        username: username,
        per_page: 1000000000000,
      }
    );

    const followers = data.map((follower) => ({
      profileUrl: follower.html_url,
      picUrl: follower.avatar_url,
    }));

    return followers;
  } catch (error) {
    console.error("Error fetching followers:", error.message);
  }
};

async function main() {
  const followers = await getLatestFollowers();

  let readme = readFileSync(READMEFILE_PATH, "utf-8");
  readme = readme.replace(
    /(?<=<!--START_SECTION:top-followers-->\n)[\s\S]*(?=\n<!--END_SECTION:top-followers-->)/,
    `<div style="display: flex; justify-content: center; flex-wrap: wrap;">` +
      followers
        .map(
          (follower) =>
            `<a href="${follower.profileUrl}" target="_blank"><img src="${follower.picUrl}" alt="Follower" width="50" height="50" style="border-radius: 50%; margin: 3px;"/></a>`
        )
        .join("\n") +
      `</div>`
  );
  writeFileSync(READMEFILE_PATH, readme);
}

main();
