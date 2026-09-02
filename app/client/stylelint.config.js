module.exports = {
    extends: [
        'stylelint-config-standard-scss',
        'stylelint-config-standard-vue/scss',
        'stylelint-config-prettier-scss',
        'stylelint-config-recess-order',
    ],
    rules: {
        'no-descending-specificity': null,
        'scss/at-mixin-pattern': null,
        'selector-max-type': null,
        'no-empty-source': null,
    },
};
