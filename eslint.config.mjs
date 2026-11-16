import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // components/ui e cod shadcn copiat ca atare; îl ținem identic cu sursa,
    // deci regulile noi ale React Compiler nu se aplică aici.
    files: ["components/ui/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", ".claude/**", "out/**", "build/**", "next-env.d.ts"]),
]);
