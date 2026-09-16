import { useEffect } from "react";

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function useDocumentMeta(options: {
  title: string;
  description: string;
  url?: string;
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = options.title;
    upsertMeta("name", "description", options.description);
    upsertMeta("property", "og:title", options.title);
    upsertMeta("property", "og:description", options.description);
    if (options.url) {
      upsertMeta("property", "og:url", options.url);
      upsertLink("canonical", options.url);
    }

    return () => {
      document.title = previousTitle;
    };
  }, [options.title, options.description, options.url]);
}
