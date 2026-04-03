import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^https?:\/\//i.test(value), {
    message: "Use a valid http/https URL"
  });

export const generatorSchema = z.object({
  bugId: z.string().optional(),
  issueType: z.enum([
    "Accessibility",
    "Functional",
    "Usability",
    "Visual",
    "Regression"
  ]),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  wcagVersion: z.enum(["2.1", "2.2"]),
  projectId: z.string().optional(),
  component: z.string().min(2, "Component is required"),
  screenName: z.string().min(2, "Screen or page name is required"),
  affectedUsers: z.string().min(2, "Affected users are required"),
  actualBehavior: z.string().min(10, "Describe the actual behavior"),
  expectedBehavior: z.string().min(10, "Describe the expected behavior"),
  wcagCriterion: z.string().min(2, "WCAG criterion is required"),
  toolsUsed: z.string().min(2, "Tools used are required"),
  reproductionSteps: z.string().optional(),
  browserInfo: z.string().optional(),
  operatingSystem: z.string().optional(),
  deviceInfo: z.string().optional(),
  assistiveTechnology: z.string().optional(),
  videoUrl: optionalUrl,
  screenshotUrls: z.string().optional(),
  notes: z.string().optional()
});

export type GeneratorFormValues = z.infer<typeof generatorSchema>;