export default {
  get<T>(key: string, defaultValue: T): T {
    if (typeof localStorage === "undefined") {
      return defaultValue;
    }
    const json = localStorage.getItem(`app_${key}`);
    if (json === null) {
      return defaultValue;
    }
    return JSON.parse(json);
  },
  set(key: string, value: any) {
    localStorage.setItem(`app_${key}`, JSON.stringify(value));
  },
};
