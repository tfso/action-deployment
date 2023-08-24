import { Secrets } from "../src/Secrets"
import {expect, test} from 'vitest'
import { FetchResponse } from "../src/types"

test('Test that secret string is converted to object correctly',()=>{
    let returnedsecrets = {}
    let location = ""
    let token = ""
    const func = async (url: RequestInfo,init?: RequestInit) : Promise<FetchResponse> => {
        returnedsecrets = JSON.parse(init.body.toString())
        location = url.toString()
        token = (init.headers as Record<string,string>)["Authorization"]
        return {
            json: async () => {
                return {}
            },
            status: 200
        }
    }
    const url = new URL('https://example.org/id');
    const secret = new Secrets("token",url,func)
    secret.postSecretsString(JSON.stringify({test1:"1",test2:"2"}))
    expect(returnedsecrets).toEqual({test1:"1",test2:"2"})
    expect(location).toEqual("https://example.org/id/secrets")
    expect(token).toEqual("Bearer token")
})

