// eslint.config.js (or eslint.config.mjs)
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  // Next.js recommended rulesets
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Custom rules / overrides
  {
    overrides: [
      // Allow `require()` style imports in plain JS files (scripts, node helpers)
      {
        files: ["*.js", "*.cjs", "scripts/**/*.js"],
        rules: {
          "@typescript-eslint/no-require-imports": "off"
        }
      },

      // Keep TypeScript files strict — you can add more TS-specific overrides here
      {
        files: ["*.ts", "*.tsx"],
        // example: make sure parser options are strict (optional)
        rules: {
          // any TS-specific rule overrides can go here
        }
      }
    ],
  },
]);
