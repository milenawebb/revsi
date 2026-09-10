import { createFileRoute } from "@tanstack/react-router";
import { ImportFlow } from "@/components/ImportFlow";

export const Route = createFileRoute("/_authenticated/import")({
  head: () => ({
    meta: [
      { title: "Import contacts · Review Requests" },
      {
        name: "description",
        content: "Bring past customers in from a CSV, as contacts only or with a review request.",
      },
      { property: "og:title", content: "Import contacts · Review Requests" },
      {
        property: "og:description",
        content: "Bring past customers in from a CSV, as contacts only or with a review request.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ImportFlow />,
});
