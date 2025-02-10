// .stylelintrc.cjs
module.exports = {
    extends: [
      // you can extend a standard config if needed
      "stylelint-config-standard",
    ],
    rules: {
      "at-rule-no-unknown": [
        true,
        {
          ignoreAtRules: ["tailwind", "apply", "variants", "responsive", "screen"],
        },
      ],
    },
  };
  