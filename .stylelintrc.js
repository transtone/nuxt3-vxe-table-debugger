module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue'
  ],
  'plugins': [
    "@stylistic/stylelint-plugin" // Stylelint-16 has removed 76 rules
  ],
  rules: {
    '@stylistic/indentation': 2,
    // 'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep'], },],
    // 允许使用 less 的 if 函数
    'function-no-unknown': [true, {
      ignoreFunctions: ['if'],
    }],
    // 设置 selector-class-pattern 允许做样式穿透
    'selector-class-pattern': null,
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep'] }],
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    'selector-type-no-unknown': null,
    // 'at-rule-no-unknown': null,
    // 解决 scss 中无法识别 @mixin 和 @include 语法的问题
    'at-rule-no-unknown': [true, { ignoreAtRules: ['mixin', 'extend', 'content', 'include'], },],
    'no-duplicate-selectors': null,
    'no-empty-source': null,
  }
}