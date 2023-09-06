import { Secrets } from "../Secrets";
import { expect, test } from "vitest";
import { Fetch, FetchResponse } from "../types";

test("Test that secret string is converted to object correctly", () => {
  let returnedsecrets = {};
  let location = "";
  let token = "";
  const func = async (
    url: RequestInfo,
    init?: RequestInit
  ): Promise<FetchResponse> => {
    console.log("Blah", init);
    returnedsecrets = JSON.parse(init.body.toString());
    location = url.toString();
    token = (init.headers as Record<string, string>)["Authorization"];
    return {
      json: async () => {
        return {};
      },
      status: 200,
    };
  };
  const url = new URL("https://example.org/id");
  const secret = new Secrets("token", url);
  secret.postSecretsString(
    JSON.stringify({ test1: "1", test2: "2" }),
    func as Fetch
  );
  expect(returnedsecrets).toEqual({ test1: "1", test2: "2" });
  expect(location).toEqual("https://example.org/id/secrets");
  expect(token).toEqual("Bearer token");
});
