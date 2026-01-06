import { defineEventHandler, readBody } from 'h3'

let cachedToken: string | null = null
let cachedTokenExpires = 0

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const query = body?.query

    if (!query) {
        return { error: "Missing GraphQL query" }
    }

    const now = Date.now()

    // Refresh token if missing or expired
    if (!cachedToken || now >= cachedTokenExpires) {
        const tokenResponse = await fetch("https://www.fflogs.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.FFLOGS_CLIENT_ID!,
                client_secret: process.env.FFLOGS_CLIENT_SECRET!,
            }),
        })

        const tokenData = await tokenResponse.json()

        if (!tokenData.access_token) {
            return { error: "Failed to get FFLogs token" }
        }

        cachedToken = tokenData.access_token
        cachedTokenExpires = now + tokenData.expires_in * 1000 - 5000
    }

    // Make GraphQL request
    const gqlResponse = await fetch("https://www.fflogs.com/api/v2/client", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${cachedToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    })

    const data = await gqlResponse.json()
    return data
})
