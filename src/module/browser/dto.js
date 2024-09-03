export function ConnectDTO({
  args = [],
  headless = "auto",
  customConfig = {},
  proxy = {},
  skipTarget = [],
  fingerprint = false,
  turnstile = false,
  connectOption = {},
  fpconfig = {},
}) {
  this.headless = headless;
  this.args = args;
  this.customConfig = customConfig;
  this.skipTarget = skipTarget;
  this.fingerprint = fingerprint;
  this.turnstile = turnstile;
  this.connectOption = connectOption;
  this.proxy = proxy;
  this.fpconfig = fpconfig;
}
