// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// biome-ignore lint/style/noDefaultExport: Astro config files must use a default export.
export default defineConfig({
  site: "https://runmark.exitzerolabs.com",
  integrations: [
    starlight({
      title: "Runmark",
      description: "Repo-native HTTP workflows for developers and coding agents.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/exit-zero-labs/runmark",
        },
      ],
      sidebar: [
        {
          label: "Overview",
          items: [
            { label: "Quickstart", slug: "guides/quickstart" },
            { label: "Product overview", slug: "reference/product-overview" },
          ],
        },
        {
          label: "Runmark",
          items: [
            { label: "Brand foundation", slug: "runmark/brand-foundation" },
            {
              label: "Voice and messaging",
              slug: "runmark/voice-and-messaging",
            },
            { label: "Visual system", slug: "runmark/visual-system" },
            { label: "Applications", slug: "runmark/applications" },
            {
              label: "Rebrand transition",
              slug: "runmark/rebrand-transition",
            },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Migrate from httpi", slug: "guides/migrate-from-httpi" },
            { label: "Agent guide", slug: "guides/agent-guide" },
            {
              label: "Contributor setup",
              slug: "guides/contributor-get-started",
            },
          ],
        },
        {
          label: "Reference",
          items: [
            {
              label: "Technical architecture",
              slug: "reference/technical-architecture",
            },
            { label: "Roadmap", slug: "reference/roadmap" },
            { label: "Support", slug: "reference/support" },
            { label: "Changelog", slug: "reference/changelog" },
          ],
        },
      ],
    }),
  ],
});
