export function processPlayerAnswers(answers: any[]) {
    debugger


    const correctAnswers = answers.filter((el) => el.question.answers[0].status === 'Correct').length;
    const lastAnswerTime = new Date(
        Math.max(...answers.map((el) => new Date(el.question.answers[0].createdAt).getTime()))
    );

    return {
        lastAnswerTime: correctAnswers === 0 ? 'not' : lastAnswerTime.toISOString(),
        correctAnswers: correctAnswers
    };
}
