/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Latency of load event (the browser load event)
 */
export interface HttpsProtonMeWebDrivePerformanceLoadHistogramV1SchemaJson {
  Labels: {
    pageType: "filebrowser" | "computers" | "photos" | "shared_by_me" | "shared_with_me" | "trash" | "public_page";
  };
  Value: number;
}