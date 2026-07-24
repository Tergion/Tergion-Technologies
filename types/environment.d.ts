export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GHL_ASSESSMENT_OBJECT_SCHEMA_KEY?: string;
      GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY?: string;
    }
  }

  interface CloudflareEnv {
    GHL_ASSESSMENT_OBJECT_SCHEMA_KEY: string;
    GHL_ASSESSMENT_CONTACT_ASSOCIATION_KEY: string;
  }
}
