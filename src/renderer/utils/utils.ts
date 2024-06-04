export function jsonParse(
  jsonStr: string | null | undefined,
  defaultValue?: {} | [],
) {
  let result = defaultValue;
  if (!jsonStr) {
    return result;
  }
  try {
    result = JSON.parse(jsonStr);
  } catch (e) {
    result = defaultValue;
  }
  return result;
}

export function jsonStringify(jsonObj: object, defaultValue?: string) {
  let result = defaultValue;
  if (
    !jsonObj ||
    ['string', 'number', 'boolean', 'bigint'].includes(typeof jsonObj)
  ) {
    return result;
  }
  try {
    result = JSON.stringify(jsonObj);
  } catch (e) {
    result = defaultValue;
  }
  return result;
}
