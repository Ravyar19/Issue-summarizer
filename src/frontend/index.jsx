import React, { useState } from "react";
import { Button, Text, TextArea, Stack, StatusLozenge } from "@forge/react";
import ForgeReconciler from "@forge/react";
import { invoke } from "@forge/bridge";

const App = () => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGenerateSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke("generateSummary");

      if (typeof result === "string") {
        setSummary(result);
      } else {
        console.error("Unexpected result format from generateSummary:", result);
        setError("Unexpected response from the backend.");
      }
    } catch (err) {
      console.error("Error in handleGenerateSummary:", err);
      setError(err.message || "Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySummary = async () => {
    try {
      setLoading(true);
      setError(null);
      await invoke("applySummary", { summary });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to apply summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing="large">
      {error && (
        <StatusLozenge appearance="removed" isBold>
          {error}
        </StatusLozenge>
      )}

      {success && (
        <StatusLozenge appearance="success" isBold>
          Summary applied successfully!
        </StatusLozenge>
      )}

      <TextArea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        isDisabled={loading}
        placeholder="Generated summary will appear here..."
        rows={5}
      />

      <Stack orientation="horizontal" spacing="medium">
        <Button
          appearance="primary"
          onClick={handleGenerateSummary}
          isLoading={loading}
          isDisabled={loading}
        >
          Generate New Summary
        </Button>
        <Button
          appearance="primary"
          onClick={handleApplySummary}
          isLoading={loading}
          isDisabled={loading || !summary.trim()}
        >
          Apply Summary
        </Button>
      </Stack>
    </Stack>
  );
};

ForgeReconciler.render(<App />);
