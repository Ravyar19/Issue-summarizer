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

async function generateClaudeSummary(description) {
  if (!description || typeof description !== "string") {
    throw new Error("Invalid description provided");
  }

  try {
    console.log("Generating summary using claude");

    const anthropicApiKey = process.env.CLAUDE_API_KEY;

    const payload = {
      model: "claude-3-5-sonnet-20241022",
      messages: [
        {
          role: "user",
          content: `Summarize the following jira issue description: ${description}`,
        },
      ],
      max_tokens: 256,
      stream: false,
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": anthropicApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Error from claude api:", errorDetails);
      throw new Error(`Claude API Error: ${errorDetails}`);
    }
    const data = await response.json();
    console.log("Claude API response:", data);
    // Extract text from the content array
    const summary = data.content
      ?.map((item) => (item.type === "text" ? item.text : ""))
      .join("\n")
      .trim();

    if (!summary) {
      throw new Error("Did not generate valid summary");
    }
    return summary;
  } catch (error) {
    console.error("Error generating summary", error);
    throw new Error("Failed to generate summary using claude");
  }
}

export const handler = resolver.getDefinitions();
