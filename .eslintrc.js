module.exports = {
    env: {
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        sourceType: "module"
    },
    plugins: [
        "@typescript-eslint/eslint-plugin"
    ],
    rules: {
        "@typescript-eslint/ban-ts-comment": "warn",
        "prettier/prettier": "error"
    },
    root: true,
};