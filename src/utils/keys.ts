//* STR
export const LOGCHANNEL = (guild: string) => `guild:${guild}:logchannel`;
//* NUM
export const SCAM_THRESHOLD = (guild: string) => `guild:${guild}:scam_threshold`;
//* NUM (seconds)
export const SCAM_EXPIRE_SECONDS = (guild: string) => `guild:${guild}:scam_expire_seconds`;
//* NUM
export const SPAM_THRESHOLD = (guild: string) => `guild:${guild}:spam_threshold`;
//* NUM (seconds)
export const SPAM_EXPIRE_SECONDS = (guild: string) => `guild:${guild}:spam_expire_seconds`;
//* NUM
export const MENTION_THRESHOLD = (guild: string) => `guild:${guild}:mention_threshold`;
//* NUM(seconds)
export const MENTION_EXPIRE_SECONDS = (guild: string) => `guild:${guild}:mentions_expire_seconds`;
//* NUM
export const USER_SPAM = (guild: string, user: string, hash: string) =>
	`guild:${guild}:user:${user}:contenthash:${hash}`;
//* NUM
export const USER_SCAM = (guild: string, user: string) => `guild:${guild}:user:${user}:scams`;
//* STR
export const USER_MENTIONS = (guild: string, user: string) => `guild:${guild}:user:${user}:mentions`;
//* STR
export const SCAM_DOMAINS = 'scamdomains';
