// eslint-disable-next-line @typescript-eslint/ban-types -- {} is actually necessary here
export type StringWithAutocompleteOptions<TOptions extends string> = (string & {}) | TOptions;
