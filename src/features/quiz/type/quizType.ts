



export enum statusQuiz {
    PendingSecondPlayer = "PendingSecondPlayer",
    Active = "Active",
    Finished = "Finished",
}

export enum publishedStatus {
    all = 'all',
    published = 'published',
    notPublished = 'notPublished'
}


export enum playerstatus {
    win = 'win',
    lose = 'lose',
    draft = 'draft'
}



export type inputQuestionsCreateT = {
    body: string,
    correctAnswers: string[],
    published: boolean,
    createdAt: string
}

export type inputQuestionsUpdateT = {
    body: string,
    correctAnswers: string[],
    updatedAt: string
}



