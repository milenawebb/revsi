import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Review Requests Dashboard" },
      {
        name: "description",
        content: "Track jobs, automated review requests, and click-through performance.",
      },
      { property: "og:title", content: "Review Requests Dashboard" },
      {
        property: "og:description",
        content: "Track jobs, automated review requests, and click-through performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/jobs" });
  },
  component: () => null,
});
