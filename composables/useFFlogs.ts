export async function fetchTimelineEvents(reportCode: string, fightId: number, start = 0) {
    const query = `
    {
        reportData {
        report(code: "${reportCode}") {
            masterData { 
                actors { id name type subType }
                abilities { gameID name type icon } 
            }
            events(
                fightIDs: [${fightId}]
                startTime: ${start},
                dataType: DamageTaken
            ) {
                data
                nextPageTimestamp
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

export async function fetchActiveAbilities(reportCode: string, fightId: number, start = 0) {
    const query = `
    {
        reportData {
        report(code: "${reportCode}") {
            events(
                fightIDs: [${fightId}]
                startTime: ${start},
                dataType: Casts
            ) {
                data
                nextPageTimestamp
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