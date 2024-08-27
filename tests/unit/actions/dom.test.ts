/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test, beforeAll } from "@jest/globals";
import {
    getElementByAPICId,
    replaceAPIC,
    refetchAPIC,
} from "../../../src/lib/actions";
import { mockFetch, type FetchMockData } from "./mock-fetch";

describe("Test DOM manipulation utilities", () => {
    let mockData: FetchMockData | null = null;
    beforeAll(() => {
        mockData = mockFetch((url) => {
            if (url.includes("replacementId")) {
                return "<div>After</div>";
            }

            if (url.includes("id")) {
                return "<div>Reloaded</div>";
            }

            return "NA";
        });

        const div = document.createElement("div");
        div.setAttribute("ref", "replacementId");
        document.body.appendChild(div);

        const div2 = document.createElement("div");
        div2.setAttribute("ref", "id");
        div2.textContent = "Before";
        document.body.appendChild(div2);

        const div3 = document.createElement("div");
        div3.setAttribute("ref", "id2");
        div3.textContent = "Before";
        document.body.appendChild(div3);
    });
    test("getElementByAPICId", () => {
        expect(getElementByAPICId("id")).toBeTruthy();
    });

    test("replaceAPIC 1", async () => {
        expect(getElementByAPICId("id")?.textContent).toBe("Before");
        await replaceAPIC("id", "replacementId", { foo: "bar" });
        expect(getElementByAPICId("id")?.textContent).toBe("After");

        const requests = mockData?.requests ?? [];
        const matchedUrl = requests.find((url) =>
            url.includes("/components/replacementId?foo=bar"),
        );

        expect(matchedUrl).toBeTruthy();
    });

    test("refetchAPIC 2", async () => {
        expect(getElementByAPICId("id2")?.textContent).toBe("Before");
        await refetchAPIC("id2", { foo: "bar" });
        console.log(mockData);
        expect(getElementByAPICId("id2")?.textContent).toBe("Reloaded");

        const requests = mockData?.requests ?? [];
        const matchedUrl = requests.find((url) =>
            url.includes("/components/id2?foo=bar"),
        );

        expect(matchedUrl).toBeTruthy();
    });
});
