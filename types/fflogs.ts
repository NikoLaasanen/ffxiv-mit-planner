type fflogs_actor = {
    gameID: number,
    icon: String,
    id: number,
    name: String,
    petOwner: number,
    server: String,
    subType: String,
    type: String
}

type fflogs_ability = {
    gameID: number,
    name: String,
    type: String,
    icon: String
}

type fflogs_event = {
    timestamp: number,
    type: String,
    packetId?: number,
    sourceID: number,
    targetID: number,
    abilityGameID: number,
    fight: number,
    extraInfo?: number,
    duration?: number
    markerID?: number
    amount?: number,
    absorbed?: number,
    unmitigatedAmount?: number,
    hitType?: number
}