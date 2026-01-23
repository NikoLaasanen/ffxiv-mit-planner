async function fetchFFLogsData(
    reportCode: string,
    fightId: number,
    dataType: string,
    start = 0,
    includeMasterData = false
) {
    let eventsQuery = `
            events(
                fightIDs: [${fightId}]
                startTime: ${start},
                dataType: ${dataType}
            ) {
                data
                nextPageTimestamp
            }
    `

    let masterDataQuery = ''
    if (includeMasterData) {
        masterDataQuery = `
            masterData { 
                actors { id name type subType }
                abilities { gameID name type icon } 
            }
        `
    }

    const query = `
    {
        reportData {
        report(code: "${reportCode}") {
            ${masterDataQuery}
            ${eventsQuery}
        }
        }
    }
    `

    return await $fetch('/api/fflogs', {
        method: 'POST',
        body: { query }
    })
}

export async function fetchTimelineEvents(reportCode: string, fightId: number, start = 0) {
    return fetchFFLogsData(reportCode, fightId, 'DamageTaken', start, true)
}

export async function fetchActiveAbilities(reportCode: string, fightId: number, start = 0) {
    return fetchFFLogsData(reportCode, fightId, 'Casts', start)
}

export async function fetchPlayerDebuffs(reportCode: string, fightId: number, start = 0) {
    return fetchFFLogsData(reportCode, fightId, 'Debuffs', start)
}

export async function fetchPlayerDeaths(reportCode: string, fightId: number, start = 0) {
    return fetchFFLogsData(reportCode, fightId, 'Deaths', start)
}

export async function fetchFightData(reportCode: string, fightId: number) {
    const query = `
    {
        reportData {
            report(code: "${reportCode}") {
                fights(
                    fightIDs: [${fightId}]
                ) {
                    id
                    name
                    encounterID
                    startTime
                    endTime
                    kill
                    bossPercentage
                    fightPercentage
                    difficulty
                    size
                }
            }
        }
    }
    `

    return await $fetch('/api/fflogs', {
        method: 'POST',
        body: { query }
    })
}