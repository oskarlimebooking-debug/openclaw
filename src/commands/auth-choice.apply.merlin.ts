import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { applyAgentDefaultModelPrimary } from "./onboard-auth.config-shared.js";

const MERLIN_DEFAULT_MODEL = "merlin/gemini-3.0-flash";

export async function applyAuthChoiceMerlin(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (params.authChoice !== "merlin") {
    return null;
  }

  let email = params.opts?.merlinEmail?.trim() ?? "";
  let password = params.opts?.merlinPassword?.trim() ?? "";

  if (!email) {
    const value = await params.prompter.text({
      message: "Enter Merlin email",
      validate: (val) => (String(val ?? "").trim() ? undefined : "Email is required"),
    });
    email = String(value ?? "").trim();
  }

  if (!password) {
    const value = await params.prompter.text({
      message: "Enter Merlin password",
      validate: (val) => (String(val ?? "").trim() ? undefined : "Password is required"),
    });
    password = String(value ?? "").trim();
  }

  await params.prompter.note(
    [
      "Merlin credentials are read from environment variables at runtime.",
      "Add these to your shell profile (~/.bashrc or ~/.zshrc):",
      "",
      `  export MERLIN_EMAIL="${email}"`,
      `  export MERLIN_PASSWORD="<your-password>"`,
      "",
      "Then run: source ~/.bashrc (or ~/.zshrc)",
      "And restart the gateway for changes to take effect.",
    ].join("\n"),
    "Merlin AI",
  );

  let config = params.config;
  const defaultModel = MERLIN_DEFAULT_MODEL;

  if (params.setDefaultModel) {
    config = applyAgentDefaultModelPrimary(config, defaultModel);
    await params.prompter.note(`Default model set to ${defaultModel}`, "Model configured");
  }

  return {
    config,
    agentModelOverride: params.setDefaultModel ? undefined : defaultModel,
  };
}
