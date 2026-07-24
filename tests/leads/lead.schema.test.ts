import { describe, expect, it } from "vitest";

import {
  leadContactBasicsStepSchema,
  leadContactPreferencesStepSchema,
  leadSubmissionSchema,
} from "@/features/leads/lead.schema";
import {
  makeAssessmentSubmission,
  makeLeadSubmission,
} from "@/tests/fixtures/leads";

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

  it("keeps last name and phone optional for an email Quick Request", () => {
    const withoutOptionalContact = leadSubmissionSchema.safeParse(
      makeLeadSubmission({
        lastName: undefined,
        phone: undefined,
        preferredContactMethod: "email",
      }),
    );
    const blankOptionalContact = leadSubmissionSchema.safeParse(
      makeLeadSubmission({
        lastName: "",
        phone: "",
        preferredContactMethod: "no-preference",
      }),
    );

    expect(withoutOptionalContact.success).toBe(true);
    expect(blankOptionalContact.success).toBe(true);
  });

  it("discards a non-empty invalid optional phone for email contact", () => {
    const result = leadSubmissionSchema.safeParse(
      makeLeadSubmission({ phone: "123", preferredContactMethod: "email" }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      preferredContactMethod: "email",
      phone: undefined,
    });
  });

  it("preserves valid optional phones and rejects invalid required phones", () => {
    const validOptional = leadSubmissionSchema.safeParse(
      makeLeadSubmission({
        phone: "+1 555 123 4567",
        preferredContactMethod: "email",
      }),
    );
    const invalidRequired = leadSubmissionSchema.safeParse(
      makeLeadSubmission({ phone: "123", preferredContactMethod: "phone" }),
    );

    expect(validOptional.success).toBe(true);
    expect(validOptional.data?.phone).toBe("+1 555 123 4567");
    expect(invalidRequired.success).toBe(false);
    expect(invalidRequired.error?.issues.map((issue) => issue.path[0])).toContain(
      "phone",
    );
  });

  it("validates Quick Request contact basics independently of preferences", () => {
    const result = leadContactBasicsStepSchema.safeParse({
      ...makeLeadSubmission(),
      schedulingPreference: "",
    });

    expect(result.success).toBe(true);
  });

  it("validates scheduling and conditional phone on the preferences step", () => {
    const missingScheduling = leadContactPreferencesStepSchema.safeParse({
      ...makeLeadSubmission(),
      schedulingPreference: "",
    });
    const missingPhone = leadContactPreferencesStepSchema.safeParse({
      ...makeLeadSubmission({
        preferredContactMethod: "text",
        phone: undefined,
      }),
    });
    const discardedOptionalPhone =
      leadContactPreferencesStepSchema.safeParse({
        ...makeLeadSubmission({
          preferredContactMethod: "email",
          phone: "123",
        }),
      });

    expect(missingScheduling.success).toBe(false);
    expect(missingScheduling.error?.issues[0]?.path[0]).toBe(
      "schedulingPreference",
    );
    expect(missingPhone.success).toBe(false);
    expect(missingPhone.error?.issues[0]?.path[0]).toBe("phone");
    expect(discardedOptionalPhone.success).toBe(true);
    expect(discardedOptionalPhone.data?.phone).toBeUndefined();
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

  it("maps a legacy payload without a discriminator to Quick Request", () => {
    const { submissionType: _submissionType, formVersion: _formVersion, ...legacy } =
      makeLeadSubmission();
    void _submissionType;
    void _formVersion;

    const result = leadSubmissionSchema.safeParse(legacy);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      submissionType: "quick_request",
      formVersion: "quick_request_v1",
    });
  });

  it("accepts a valid eight-step automation assessment", () => {
    const result = leadSubmissionSchema.safeParse(makeAssessmentSubmission());

    expect(result.success).toBe(true);
  });

  it("requires a valid assessment submission nonce", () => {
    const {
      submissionNonce: _submissionNonce,
      ...withoutSubmissionNonce
    } = makeAssessmentSubmission();
    void _submissionNonce;

    const missing = leadSubmissionSchema.safeParse(withoutSubmissionNonce);
    const invalid = leadSubmissionSchema.safeParse({
      ...makeAssessmentSubmission(),
      submissionNonce: "not-a-uuid",
    });

    expect(missing.success).toBe(false);
    expect(invalid.success).toBe(false);
    expect(invalid.error?.issues.map((issue) => issue.path[0])).toContain(
      "submissionNonce",
    );
  });

  it("requires an assessment follow-up preference", () => {
    const {
      assessmentFollowUpPreference: _preference,
      ...withoutPreference
    } = makeAssessmentSubmission();
    void _preference;

    const result = leadSubmissionSchema.safeParse(withoutPreference);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toContain(
      "assessmentFollowUpPreference",
    );
  });

  it("requires assessment preferred contact but keeps scheduling optional", () => {
    const {
      preferredContactMethod: _contactMethod,
      schedulingPreference: _scheduling,
      ...withoutBoth
    } = makeAssessmentSubmission({ schedulingPreference: "After 5 PM" });
    void _contactMethod;
    void _scheduling;

    const missingContact = leadSubmissionSchema.safeParse(withoutBoth);
    const withoutScheduling = leadSubmissionSchema.safeParse(
      makeAssessmentSubmission(),
    );

    expect(missingContact.success).toBe(false);
    expect(
      missingContact.error?.issues.map((issue) => issue.path[0]),
    ).toContain("preferredContactMethod");
    expect(withoutScheduling.success).toBe(true);
  });

  it("does not accept Text as an assessment contact option", () => {
    const result = leadSubmissionSchema.safeParse({
      ...makeAssessmentSubmission(),
      preferredContactMethod: "text",
    });

    expect(result.success).toBe(false);
  });

  it("requires conditional Other explanations", () => {
    const result = leadSubmissionSchema.safeParse(
      makeAssessmentSubmission({
        incomingCallOwner: "other",
        biggestChallenge: "other",
      }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining([
        "incomingCallOwnerOther",
        "biggestChallengeOther",
      ]),
    );
  });

  it("normalizes a valid email to lowercase", () => {
    const result = leadSubmissionSchema.safeParse(
      makeAssessmentSubmission({ email: " PERSON@EXAMPLE.COM " }),
    );

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("person@example.com");
  });
});
