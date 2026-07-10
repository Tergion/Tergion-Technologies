import { describe, expect, it } from "vitest";

import { leadSubmissionSchema } from "@/features/leads/lead.schema";
import { makeLeadSubmission } from "@/tests/fixtures/leads";

describe("leadSubmissionSchema", () => {
  it("accepts a minimal valid lead submission", () => {
    const result = leadSubmissionSchema.safeParse(makeLeadSubmission());

    expect(result.success).toBe(true);
  });

  it("requires the core contact fields", () => {
    const result = leadSubmissionSchema.safeParse({
      ...makeLeadSubmission(),
      firstName: "",
      businessName: "",
      schedulingPreference: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining([
        "firstName",
        "businessName",
        "schedulingPreference",
      ]),
    );
  });

  it("always requires a valid email", () => {
    const missing = leadSubmissionSchema.safeParse({
      ...makeLeadSubmission(),
      email: "",
    });
    const invalid = leadSubmissionSchema.safeParse({
      ...makeLeadSubmission(),
      email: "not-an-email",
    });

    expect(missing.success).toBe(false);
    expect(invalid.success).toBe(false);
  });

  it("requires phone only when phone or text is selected", () => {
    const emailPreferred = leadSubmissionSchema.safeParse(
      makeLeadSubmission({ preferredContactMethod: "email", phone: undefined }),
    );
    const phonePreferred = leadSubmissionSchema.safeParse(
      makeLeadSubmission({ preferredContactMethod: "phone", phone: undefined }),
    );
    const textPreferred = leadSubmissionSchema.safeParse(
      makeLeadSubmission({ preferredContactMethod: "text", phone: undefined }),
    );

    expect(emailPreferred.success).toBe(true);
    expect(phonePreferred.success).toBe(false);
    expect(textPreferred.success).toBe(false);
  });

  it("requires contact consent and privacy terms consent", () => {
    const result = leadSubmissionSchema.safeParse(
      makeLeadSubmission({
        contactConsent: false,
        privacyTermsConsent: false,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["contactConsent", "privacyTermsConsent"]),
    );
  });
});
