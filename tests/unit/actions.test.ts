import { describe, expect, test } from "@jest/globals";
import { isWebHandler } from "../../src/lib/actions";
import type { WebActions } from "lean-jsx-types/events";
import { withClientData } from "../../src/lib/with-client-data";

describe("Test action utilities", () => {
  test("isWebHandler", () => {
    expect(isWebHandler(["style", ""])).toBeFalsy();
    expect(isWebHandler(["onclick", ""])).toBeFalsy();
    expect(
      isWebHandler(["onclick", (_ev: Event, _actions: WebActions) => {}]),
    ).toBeTruthy();
    expect(isWebHandler(["onclick", (_ev: Event) => {}])).toBeTruthy();
    expect(
      isWebHandler([
        "onclick",
        withClientData(
          { id: "" },
          (_ev: Event, _actions: WebActions, _data: { id: string }) => {},
        ),
      ]),
    ).toBeTruthy();
  });
});
