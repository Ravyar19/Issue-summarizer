import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";

const resolver = new Resolver();

// Fetch issue details

async function getIssueDetails(issueKey) {
  try {
    const response = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${issueKey}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch issue details: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.log("error fetching issue details:", error);
    throw new Error("Failed to fetch issue details");
  }
}

async function updateIssueSummary(issueKey, summary) {
  console.log("Updating summary for issue:", issueKey);

  if (typeof summary !== "string" || !summary.trim()) {
    throw new Error("Summary must be a not empty string");
  }

  try {
    const response = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${issueKey}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            summary: summary.trim(),
          },
        }),
      });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error("Error updating issue summary:", responseBody);
      throw new Error(`Failed to update issue summary:  ${response.status}`);
    }
    console.log("Summary updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating issue summary", error);
    throw new Error("Failed to update issue summary");
  }
}

function extractTextFromProseMirror(proseMirrorContent) {
  if (!proseMirrorContent || !Array.isArray(proseMirrorContent)) {
    return "";
  }

  return proseMirrorContent
    .map((node) => {
      if (node.type === "paragraph" && node.content) {
        return node.content
          .map((child) => (child.type === "text" ? child.text : ""))
          .join("");
      }
      return "";
    })
    .join("\n");
}

export const handler = resolver.getDefinitions();
