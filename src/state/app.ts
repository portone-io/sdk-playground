import { computed, Signal, signal } from "@preact/signals";
import { MajorVersion, SdkV1Version, SdkV2Version, SdkVersion } from "../sdk";
import persisted, { prefix } from "./persisted";

interface AppModeBase<
  TSdkVersion extends SdkVersion,
  TFunction extends string,
> {
  sdkVersion: TSdkVersion;
  function: TFunction;
}
interface AppModeV1 extends AppModeBase<SdkV1Version, "pay" | "cert"> {}
interface AppModeV2 extends AppModeBase<SdkV2Version, "pay"> {}
export type AppMode = AppModeV1 | AppModeV2;
export const appModeSignal = persisted<AppMode>(
  localStorage,
  `${prefix}.appMode`,
  { sdkVersion: "1.3.0", function: "pay" },
);

export function isV1Mode(appMode: AppMode): appMode is AppModeV1 {
  return getMajorVersion(appMode.sdkVersion) === "v1";
}
export function isV2Mode(appMode: AppMode): appMode is AppModeV2 {
  return getMajorVersion(appMode.sdkVersion) === "v2";
}

export function getMajorVersion(sdkVersion: SdkVersion): MajorVersion {
  const major = sdkVersion.split(".").shift()!;
  if (major === "1") return "v1";
  if (major === "2") return "v2";
  throw new Error();
}

type Modes<TMode extends AppModeBase<any, any>> = {
  [key in TMode["function"]]: {
    label: string;
    stateModule: () => Promise<StateModule>;
  };
};
export const modes = {
  "v1": {
    pay: { label: "결제", stateModule: () => import("./v1-pay") },
    cert: { label: "본인인증", stateModule: () => import("./v1-cert") },
  } satisfies Modes<AppModeV1>,
  "v2": {
    pay: { label: "결제", stateModule: () => import("./v2-pay") },
  } satisfies Modes<AppModeV2>,
} satisfies { [key in MajorVersion]: Modes<any> };

export interface StateModule {
  playFnSignal: Signal<PlayFn>;
}
export const stateModulePromiseSignal = computed<Promise<StateModule>>(() => {
  const appMode = appModeSignal.value;
  if (isV1Mode(appMode)) return modes.v1[appMode.function].stateModule();
  if (isV2Mode(appMode)) return modes.v2[appMode.function].stateModule();
  throw new Error();
});

export const sdkVersionSignal = computed(() => appModeSignal.value.sdkVersion);
export function changeSdkVersion(_sdkVersion: SdkVersion) {
  const sdkVersion = _sdkVersion as any;
  const beforeMajor = getMajorVersion(appModeSignal.value.sdkVersion);
  const afterMajor = getMajorVersion(sdkVersion);
  if (beforeMajor === afterMajor) {
    appModeSignal.value = { ...appModeSignal.value, sdkVersion };
    return;
  }
  switch (afterMajor) {
    case "v1": {
      appModeSignal.value = { sdkVersion, function: "pay" };
      return;
    }
    case "v2": {
      appModeSignal.value = { sdkVersion, function: "pay" };
      return;
    }
  }
}

export const waitingSignal = signal(false);
export type PlayFn = () => Promise<any>;
export const playFnSignal = computed(() => {
  const stateModulePromise = stateModulePromiseSignal.value;
  return async function play() {
    try {
      playResultSignal.value = undefined;
      waitingSignal.value = true;
      const stateModule = await stateModulePromise;
      const playFn = stateModule.playFnSignal.value;
      const response: any = await playFn();
      playResultSignal.value = { success: response.success, response };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : String(error);
      playResultSignal.value = { success: false, errorStack };
    } finally {
      waitingSignal.value = false;
    }
  };
});
export interface PlayResult {
  success: boolean;
  response?: object;
  errorStack?: string;
}
export const playResultSignal = signal<PlayResult | undefined>(undefined);
